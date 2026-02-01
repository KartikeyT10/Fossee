from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Dataset
from .serializers import DatasetSerializer
import pandas as pd
import os

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer

    def create(self, request, *args, **kwargs):
        # 1. Upload file
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance

        try:
            # 2. Process with Pandas
            file_path = instance.file.path
            # Read CSV
            df = pd.read_csv(file_path)

            # 3. Calculate Stats
            stats = {
                'total_rows': int(len(df)),
                'columns': list(df.columns),
                'preview': df.head(10).fillna('').to_dict(orient='records'), # Handle NaNs
                'numerical_stats': df.describe().fillna(0).to_dict(),        # Handle NaNs
                'type_counts': df['Type'].value_counts().to_dict() if 'Type' in df.columns else {}
            }
            
            # Save stats
            instance.summary_stats = stats
            instance.save()

            # 4. Enforce Limit of 5
            # Since ordering is -uploaded_at, the first 5 are the newest.
            all_datasets = Dataset.objects.all()
            if all_datasets.count() > 5:
                # Keep first 5, delete rest
                to_delete = all_datasets[5:]
                for d in to_delete:
                    if d.file:
                        if os.path.exists(d.file.path):
                            os.remove(d.file.path)
                    d.delete()

            headers = self.get_success_headers(serializer.data)
            return Response(DatasetSerializer(instance).data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            # If processing fails, cleanup
            try:
                if instance.file and os.path.exists(instance.file.path):
                    os.remove(instance.file.path)
                instance.delete()
            except:
                pass
            return Response({'error': f"Processing failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
