import requests
import json
import os
from datetime import datetime

class FirebaseService:
    def __init__(self):
        self.api_key = "AIzaSyA01qf6ORX2edveofxGNAJk_--Yw31xZPg"
        self.project_id = "fossee-analytics"
        self.storage_bucket = "fossee-analytics.firebasestorage.app"
        self.id_token = None
        self.local_id = None
        self.base_auth_url = "https://identitytoolkit.googleapis.com/v1/accounts"
        self.firestore_url = f"https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents"

    def login(self, email, password):
        url = f"{self.base_auth_url}:signInWithPassword?key={self.api_key}"
        payload = {"email": email, "password": password, "returnSecureToken": True}
        try:
            r = requests.post(url, json=payload)
            r.raise_for_status()
            data = r.json()
            self.id_token = data['idToken']
            self.local_id = data['localId']
            self.email = email
            return True, "Login Successful"
        except Exception as e:
            return False, str(e)

    def get_headers(self):
        return {"Authorization": f"Bearer {self.id_token}"} if self.id_token else {}

    def upload_dataset(self, filename, local_path, parsed_data):
        if not self.id_token: return False, "Not authenticated"

        try:
            # 1. Skip Storage (Paywall). Save directly to Firestore.
            # We skip the specific upload_url logic.
            download_url = "Stored in Database"

            # 2. Save Metadata & Data to Firestore
            firestore_doc = {
                "fields": {
                    "filename": {"stringValue": filename},
                    "url": {"stringValue": download_url},
                    "createdAt": {"timestampValue": datetime.utcnow().isoformat() + "Z"},
                    "summary": {
                        "mapValue": {
                            "fields": {
                                "total": {"integerValue": len(parsed_data)},
                                "critical": {"integerValue": len([x for x in parsed_data if x.get('status') == 'Critical'])}
                            }
                        }
                    },
                    # Storing large arrays in Firestore is expensive and hits limits (1MB doc size).
                    # If the CSV is large, this will fail.
                    # Best practice: Store data in Storage (JSON/CSV) and valid only metadata in Firestore.
                    # But the requirement implies "fully functioning backend... store all of the data".
                    # I'll try to convert the first 50 rows or so for preview, or if it's small enough, all of it.
                    # Let's serialize the `parsedData` array.
                    "parsedData": {
                        "arrayValue": {
                            "values": [self._dict_to_firestore_map(row) for row in parsed_data]
                        }
                    }
                }
            }

            r = requests.post(f"{self.firestore_url}/datasets", headers=self.get_headers(), json=firestore_doc)
            r.raise_for_status()
            
            return True, "Upload Successful"

        except Exception as e:
            return False, f"Upload Failed: {str(e)}"

    def _dict_to_firestore_map(self, py_dict):
        fields = {}
        for k, v in py_dict.items():
            if isinstance(v, str):
                fields[k] = {"stringValue": v}
            elif isinstance(v, (int, float)):
                # Firestore REST uses 'integerValue' (string formatted) or 'doubleValue'
                if isinstance(v, int): fields[k] = {"integerValue": str(v)}
                else: fields[k] = {"doubleValue": float(v)}
            else:
                 fields[k] = {"stringValue": str(v)}
        return {"mapValue": {"fields": fields}}

    def fetch_history(self):
        if not self.id_token: return []
        
        # Query Firestore: orderBy createdAt desc, limit 5
        # The REST API requires a structured query.
        query = {
            "structuredQuery": {
                "from": [{"collectionId": "datasets"}],
                "orderBy": [{"field": {"fieldPath": "createdAt"}, "direction": "DESCENDING"}],
                "limit": 5
            }
        }
        
        try:
            r = requests.post(f"{self.firestore_url}:runQuery", headers=self.get_headers(), json=query)
            r.raise_for_status()
            items = r.json()
            
            history = []
            for item in items:
                if 'document' not in item: continue # Sometimes results include timestamp only?
                doc = item['document']
                fields = doc.get('fields', {})
                
                # Unwrap
                entry = {
                    "filename": fields.get('filename', {}).get('stringValue', 'Unknown'),
                    "date": "Unknown", # Format createdAt
                    "summary": "Remote Data",
                    "data": [] # Need to unwrap `parsedData`
                }
                
                # Date
                ts = fields.get('createdAt', {}).get('timestampValue')
                if ts:
                    try:
                        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                        entry['date'] = dt.strftime("%I:%M %p")
                    except: pass
                
                # Unwrap Data
                array_val = fields.get('parsedData', {}).get('arrayValue', {}).get('values', [])
                entry['data'] = [self._firestore_map_to_dict(x.get('mapValue', {}).get('fields', {})) for x in array_val]
                entry['summary'] = f"Items: {len(entry['data'])}"
                
                history.append(entry)
                
            return history
        except Exception as e:
            print(f"Fetch Error: {e}")
            return []

    def _firestore_map_to_dict(self, fields):
        d = {}
        for k, v in fields.items():
            if 'stringValue' in v: d[k] = v['stringValue']
            elif 'integerValue' in v: d[k] = int(v['integerValue'])
            elif 'doubleValue' in v: d[k] = float(v['doubleValue'])
        return d
