import sys
import requests
from datetime import datetime
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QFileDialog, 
                             QTableWidget, QTableWidgetItem, QMessageBox, QHeaderView, QFrame, QGridLayout, QLineEdit, QDialog, QFormLayout)
from PyQt5.QtPrintSupport import QPrinter
from PyQt5.QtGui import QTextDocument, QPainter
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QColor
# Matplotlib for charts
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.pyplot as plt

# --- Global Constants ---
from firebase_service import FirebaseService

# --- Global Service ---
firebase = FirebaseService()

# --- Dark Theme Stylesheet ---
DARK_THEME_QSS = """
QMainWindow, QWidget {
    background-color: #111315;
    color: #ffffff;
    font-family: 'Segoe UI', sans-serif;
}

/* Sidebar */
QFrame#Sidebar {
    background-color: #0d0e10;
    border-right: 1px solid #1f2937;
}
QPushButton#SidebarBtn {
    text-align: left;
    padding: 12px 20px;
    border: none;
    color: #9ca3af;
    font-size: 14px;
    background-color: transparent;
}
QPushButton#SidebarBtn:hover {
    background-color: #1f2937;
    color: white;
}
QPushButton#SidebarBtn:checked {
    background-color: #1f2937;
    color: #3b82f6;
    border-left: 3px solid #3b82f6;
}

/* Top Bar */
QFrame#TopBar {
    background-color: #111315;
    border-bottom: 1px solid #1f2937;
}
QLineEdit {
    background-color: #1a1d21;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 8px;
    color: white;
}

/* KPI Cards */
QFrame#StatCard {
    background-color: #1a1d21;
    border: 1px solid #1f2937;
    border-radius: 8px;
}
QLabel#StatValue {
    font-size: 28px;
    font-weight: bold;
    color: white;
}
QLabel#StatTitle {
    color: #9ca3af;
    font-size: 13px;
    font-weight: 600;
}
QLabel#StatTrendPos { color: #10b981; font-size: 11px; font-weight: bold; }
QLabel#StatTrendNeg { color: #ef4444; font-size: 11px; font-weight: bold; }

/* Table */
QTableWidget {
    background-color: #1a1d21;
    border: 1px solid #1f2937;
    border-radius: 8px;
    gridline-color: #374151;
    selection-background-color: #2563eb;
    color: #e5e7eb;
}
QHeaderView::section {
    background-color: #111315;
    color: #9ca3af;
    padding: 8px;
    border: none;
    font-weight: bold;
}

/* Buttons */
QPushButton#ActionBtn {
    background-color: #2563eb;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-weight: bold;
}
QPushButton#ActionBtn:hover {
    background-color: #1d4ed8;
}
"""

class LoginDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Login - ChemAnalytics")
        self.setFixedWidth(300)
        self.setStyleSheet("background-color: #1a1d21; color: white;")
        
        layout = QVBoxLayout()
        form = QFormLayout()
        
        self.email = QLineEdit()
        self.email.setPlaceholderText("Email")
        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setEchoMode(QLineEdit.Password)
        
        form.addRow("Email:", self.email)
        form.addRow("Password:", self.password)
        layout.addLayout(form)
        
        self.btn = QPushButton("Login")
        self.btn.setStyleSheet("background-color: #2563eb; color: white; padding: 8px; border-radius: 4px;")
        self.btn.clicked.connect(self.handle_login)
        layout.addWidget(self.btn)
        
        self.setLayout(layout)
        
    def handle_login(self):
        email = self.email.text()
        pwd = self.password.text()
        if not email or not pwd:
            QMessageBox.warning(self, "Error", "Please fill all fields")
            return
            
        success, msg = firebase.login(email, pwd)
        if success:
            self.accept()
        else:
            QMessageBox.critical(self, "Login Failed", msg)

class Sidebar(QFrame):
    def __init__(self, parent=None, on_nav_change=None):
        super().__init__(parent)
        self.setObjectName("Sidebar")
        self.setFixedWidth(240)
        self.on_nav_change = on_nav_change
        
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 20, 0, 20)
        layout.setSpacing(5)
        
        logo = QLabel("   ChemAnalytics")
        logo.setStyleSheet("font-size: 18px; font-weight: bold; color: white; margin-bottom: 20px;")
        layout.addWidget(logo)
        
        self.btn_group = []
        menus = [("Dashboard", 0), ("Equipment List", 1), ("Analytics", 2), ("Reports", 3)]
        
        for name, idx in menus:
            btn = QPushButton(name)
            btn.setObjectName("SidebarBtn")
            btn.setCheckable(True)
            if idx == 0: btn.setChecked(True)
            btn.clicked.connect(lambda checked, i=idx, b=btn: self.handle_nav(i, b))
            layout.addWidget(btn)
            self.btn_group.append(btn)
            
        layout.addStretch()
        
        user_name = firebase.email.split('@')[0] if hasattr(firebase, 'email') and firebase.email else "Admin User"
        user_label = QLabel(f"   {user_name}")
        user_label.setStyleSheet("font-weight: bold; color: white;")
        layout.addWidget(user_label)
        
        self.setLayout(layout)

    def handle_nav(self, index, clicked_btn):
        for btn in self.btn_group:
            btn.setChecked(False)
        clicked_btn.setChecked(True)
        if self.on_nav_change:
            self.on_nav_change(index)

class StatCard(QFrame):
    def __init__(self, title, value, trend, is_positive=True, parent=None):
        super().__init__(parent)
        self.setObjectName("StatCard")
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        title_lbl = QLabel(title)
        title_lbl.setObjectName("StatTitle")
        layout.addWidget(title_lbl)
        
        val_lbl = QLabel(value)
        val_lbl.setObjectName("StatValue")
        layout.addWidget(val_lbl)
        
        trend_lbl = QLabel(trend)
        trend_lbl.setObjectName("StatTrendPos" if is_positive else "StatTrendNeg")
        layout.addWidget(trend_lbl)
        
        self.setLayout(layout)

import csv
import io

class EquipmentPage(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels(["Name", "Type", "Flow", "Pressure", "Temp", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.verticalHeader().setVisible(False)
        layout.addWidget(self.table)
        
        self.setLayout(layout)

    def update_data(self, data):
        self.table.setRowCount(len(data))
        for i, row in enumerate(data):
            self.table.setItem(i, 0, QTableWidgetItem(row.get('name', '')))
            self.table.setItem(i, 1, QTableWidgetItem(row.get('type', '')))
            self.table.setItem(i, 2, QTableWidgetItem(str(row.get('flow', ''))))
            self.table.setItem(i, 3, QTableWidgetItem(str(row.get('pressure', ''))))
            self.table.setItem(i, 4, QTableWidgetItem(str(row.get('temp', ''))))
            
            status = row.get('status', 'Stable')
            status_item = QTableWidgetItem(status)
            if status == "Stable": status_item.setForeground(Qt.green)
            elif status == "Critical": status_item.setForeground(Qt.red)
            elif status == "Warning": status_item.setForeground(QColor("orange"))
            
            self.table.setItem(i, 5, status_item)

class AnalyticsPage(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Wider figure for side-by-side charts
        self.figure = Figure(figsize=(10, 5), dpi=100)
        self.figure.patch.set_facecolor('#1a1d21')
        self.canvas = FigureCanvas(self.figure)
        layout.addWidget(self.canvas)
        self.setLayout(layout)

    def update_data(self, data):
        self.figure.clear()
        if not data: return
        
        # --- Prepare Data ---
        types = {}
        status_counts = {'Stable': 0, 'Warning': 0, 'Critical': 0}
        
        for row in data:
            # Types
            t = row.get('type', 'Unknown')
            types[t] = types.get(t, 0) + 1
            
            # Status
            s = row.get('status', 'Stable')
            if s in status_counts:
                status_counts[s] += 1
            else:
                status_counts[s] = 1 # Handle unknown if any
                
        # --- Plotting ---
        # Subplot 1: Bar Chart (Types)
        ax1 = self.figure.add_subplot(121)
        ax1.set_facecolor('#1a1d21')
        ax1.bar(types.keys(), types.values(), color='#3b82f6', width=0.6)
        ax1.tick_params(axis='x', colors='#9ca3af', rotation=45)
        ax1.tick_params(axis='y', colors='#9ca3af')
        ax1.spines['bottom'].set_color('#374151')
        ax1.spines['left'].set_color('#374151')
        ax1.spines['top'].set_visible(False)
        ax1.spines['right'].set_visible(False)
        ax1.set_title("Equipment Distribution by Type", color='white', pad=20)
        
        # Subplot 2: Pie Chart (Status)
        ax2 = self.figure.add_subplot(122)
        ax2.set_facecolor('#1a1d21')
        
        # Filter zero values for cleaner pie
        labels = [k for k, v in status_counts.items() if v > 0]
        sizes = [v for k, v in status_counts.items() if v > 0]
        
        # Colors: Green, Orange, Red
        color_map = {'Stable': '#10b981', 'Warning': '#f59e0b', 'Critical': '#ef4444'}
        colors = [color_map.get(l, '#9ca3af') for l in labels]
        
        if sizes:
            wedges, texts, autotexts = ax2.pie(sizes, labels=labels, autopct='%1.1f%%',
                                               startangle=90, colors=colors,
                                               textprops={'color': "white"})
            # Style text
            for t in texts: t.set_color('white')
            for at in autotexts: at.set_color('white')
            
        ax2.set_title("System Status Overview", color='white', pad=20)

        self.figure.tight_layout()
        self.canvas.draw()

from PyQt5.QtWidgets import QTextEdit

class ReportsPage(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Header with Export Button
        header_layout = QHBoxLayout()
        title = QLabel("System Reports")
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")
        header_layout.addWidget(title)
        header_layout.addStretch()
        
        self.export_btn = QPushButton("Export PDF")
        self.export_btn.setObjectName("ActionBtn")
        self.export_btn.clicked.connect(self.export_pdf)
        self.export_btn.setEnabled(False) # Disabled until data
        header_layout.addWidget(self.export_btn)
        
        layout.addLayout(header_layout)
        
        # Report Content (Rich Text)
        self.text_edit = QTextEdit()
        self.text_edit.setReadOnly(True)
        self.text_edit.setStyleSheet("""
            QTextEdit {
                background-color: #1a1d21;
                border: 1px solid #1f2937;
                border-radius: 8px;
                padding: 20px;
                font-size: 14px;
                line-height: 1.6;
                color: #e5e7eb;
            }
        """)
        self.text_edit.setPlaceholderText("Upload a file to generate detailed performance reports.")
        layout.addWidget(self.text_edit)
        
        self.setLayout(layout)
        self.current_html = ""

    def update_data(self, data):
        if not data: return
        self.export_btn.setEnabled(True)
        
        total = len(data)
        critical = len([d for d in data if d.get('status') == 'Critical'])
        warning = len([d for d in data if d.get('status') == 'Warning'])
        stable = len([d for d in data if d.get('status') == 'Stable'])
        
        pressures = [float(d.get('pressure', 0)) or 0 for d in data if d.get('pressure')]
        avg_p = sum(pressures) / len(pressures) if pressures else 0
        
        temps = [float(d.get('temp', 0)) or 0 for d in data if d.get('temp')]
        avg_t = sum(temps) / len(temps) if temps else 0
        
        # styling for pdf/view
        current_date_str = datetime.now().strftime("%B %d, %Y")
        self.current_html = f"""
        <h2 style="color: #3b82f6;">Chemical Plant Performance Report</h2>
        <hr>
        <p><b>Date:</b> {current_date_str}</p>
        
        <h3>1. Executive Summary</h3>
        <p>The system is currently monitoring {total} units of equipment. 
        There are <span style="color: #ef4444; font-weight: bold;">{critical} critical alerts</span> 
        and <span style="color: orange; font-weight: bold;">{warning} warnings</span> requiring attention.</p>
        
        <h3>2. Key Metrics</h3>
        <table border="0" cellpadding="5" cellspacing="0" width="100%">
            <tr>
                <td width="30%"><b>Total Equipment:</b></td><td>{total}</td>
            </tr>
            <tr>
                <td><b>Average Pressure:</b></td><td>{avg_p:.2f} Bar</td>
            </tr>
            <tr>
                <td><b>Average Temperature:</b></td><td>{avg_t:.2f} &deg;C</td>
            </tr>
            <tr>
                <td><b>System Health Score:</b></td><td>{int((stable/total)*100) if total else 0}%</td>
            </tr>
        </table>
        
        <h3>3. Status Breakdown</h3>
        <ul>
            <li><span style="color: #10b981;">Stable:</span> {stable} units</li>
            <li><span style="color: orange;">Warning:</span> {warning} units</li>
            <li><span style="color: #ef4444;">Critical:</span> {critical} units</li>
        </ul>
        
        <br>
        <p style="font-size: 12px; color: #6b7280;">Generated by ChemAnalytics Desktop Client</p>
        """
        self.text_edit.setHtml(self.current_html)

    def export_pdf(self):
        if not self.current_html: return
        
        fname, _ = QFileDialog.getSaveFileName(self, "Export Report", "System_Report.pdf", "PDF Files (*.pdf)")
        if fname:
            if not fname.endswith('.pdf'): fname += '.pdf'
            
            printer = QPrinter(QPrinter.HighResolution)
            printer.setOutputFormat(QPrinter.PdfFormat)
            printer.setOutputFileName(fname)
            
            # Use styling for print (white background)
            doc = QTextDocument()
            # print style (black text on white for PDF usually preferred, or keep dark?)
            # Usually PDFs are white. Let's invert color for print using css
            print_html = self.current_html.replace("#3b82f6", "blue").replace("#ef4444", "red").replace("color: white", "color: black").replace("color: #e5e7eb", "color: black")
            # Wrap in body with white bg
            full_html = f"<html><body style='background-color: white; color: black; font-family: sans-serif;'>{print_html}</body></html>"
            
            doc.setHtml(full_html)
            doc.print_(printer)
            QMessageBox.information(self, "Success", f"Report exported to {fname}")

class ContentArea(QWidget):
    def __init__(self, parent=None, on_upload=None, on_history=None):
        super().__init__(parent)
        self.on_upload = on_upload
        self.on_history = on_history
        self.layout = QVBoxLayout()
        self.layout.setContentsMargins(30, 30, 30, 30)
        self.layout.setSpacing(20)
        
        # --- Top Bar ---
        top_bar = QHBoxLayout()
        title = QLabel("Chemical Analytics Dashboard")
        title.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        top_bar.addWidget(title)
        top_bar.addStretch()
        
        self.upload_btn = QPushButton("Upload CSV")
        self.upload_btn.setObjectName("ActionBtn")
        self.upload_btn.setCursor(Qt.PointingHandCursor)
        self.upload_btn.clicked.connect(self.upload_handlers)
        top_bar.addWidget(self.upload_btn)
        
        self.history_btn = QPushButton("History")
        self.history_btn.setObjectName("ActionBtn")
        self.history_btn.setStyleSheet("background-color: #4b5563; margin-left: 10px;")
        self.history_btn.clicked.connect(lambda: self.on_history() if self.on_history else None)
        top_bar.addWidget(self.history_btn)
        
        self.layout.addLayout(top_bar)
        
        # --- Stats ---
        self.stats_layout = QHBoxLayout()
        self.stats_layout.setSpacing(20)
        # Placeholders
        self.stat_total = StatCard("Total Equipment", "0", "--", True)
        self.stat_press = StatCard("Average Pressure", "0.0", "--", False)
        self.stat_crit = StatCard("Critical Alerts", "0", "--", False)
        
        self.stats_layout.addWidget(self.stat_total)
        self.stats_layout.addWidget(self.stat_press)
        self.stats_layout.addWidget(self.stat_crit)
        self.layout.addLayout(self.stats_layout)
        
        # --- Middle ---
        middle_layout = QHBoxLayout()
        
        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels(["Name", "Type", "Flow", "Pressure", "Temp", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.verticalHeader().setVisible(False)
        middle_layout.addWidget(self.table, stretch=3)
        
        # Chart
        chart_frame = QFrame()
        chart_frame.setObjectName("StatCard")
        chart_layout = QVBoxLayout(chart_frame)
        self.figure = Figure(figsize=(5, 4), dpi=100)
        self.figure.patch.set_facecolor('#1a1d21')
        self.canvas = FigureCanvas(self.figure)
        chart_layout.addWidget(QLabel("System Pressure Trend"))
        chart_layout.addWidget(self.canvas)
        middle_layout.addWidget(chart_frame, stretch=2)
        
        self.layout.addLayout(middle_layout)
        self.setLayout(self.layout)

    def upload_handlers(self):
        if self.on_upload:
            self.on_upload()

    def update_data(self, data):
        # Update Stats
        total = len(data)
        critical = len([d for d in data if d.get('status') == 'Critical'])
        pressures = [float(d.get('pressure', 0)) for d in data if d.get('pressure')]
        avg_p = sum(pressures) / len(pressures) if pressures else 0
        
        # Re-create cards or just update? For simplicity, we assume StatCard text is static for now, so we'd need to update labels.
        # But my StatCard class doesn't expose labels. Let's just create new ones or hack it.
        # Better: let's modifying StatCard to have update methods if possible, 
        # OR just clear layout and re-add.
        
        # Clearing layout
        while self.stats_layout.count():
            child = self.stats_layout.takeAt(0)
            if child.widget(): child.widget().deleteLater()
            
        self.stats_layout.addWidget(StatCard("Total Equipment", str(total), "+New Data", True))
        self.stats_layout.addWidget(StatCard("Average Pressure", f"{avg_p:.1f} PSI", "Updating...", True))
        self.stats_layout.addWidget(StatCard("Critical Alerts", str(critical), "Check Details", False))
        
        # Update Table
        self.table.setRowCount(len(data))
        for i, row in enumerate(data):
             self.table.setItem(i, 0, QTableWidgetItem(row.get('name', '')))
             self.table.setItem(i, 1, QTableWidgetItem(row.get('type', '')))
             self.table.setItem(i, 2, QTableWidgetItem(str(row.get('flow', ''))))
             self.table.setItem(i, 3, QTableWidgetItem(str(row.get('pressure', ''))))
             self.table.setItem(i, 4, QTableWidgetItem(str(row.get('temp', ''))))
             status = row.get('status', 'Unknown')
             item = QTableWidgetItem(status)
             if status == 'Critical': item.setForeground(Qt.red)
             if status == 'Stable': item.setForeground(Qt.green)
             if status == 'Warning': item.setForeground(QColor("orange"))
             self.table.setItem(i, 5, item)
             
        # Update Chart
        self.figure.clear()
        ax = self.figure.add_subplot(111)
        ax.set_facecolor('#1a1d21')
        ax.plot(range(len(pressures)), pressures, color='#3b82f6', marker='o', markersize=4, linestyle='-')
        ax.set_title("System Pressure Trend", color='white', fontsize=10)
        ax.grid(True, linestyle='--', alpha=0.1, color='#374151')
        ax.tick_params(colors='#9ca3af', labelsize=8)
        ax.spines['bottom'].set_color('#374151')
        ax.spines['left'].set_color('#374151')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        self.canvas.draw()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Analytics")
        self.setGeometry(100, 100, 1280, 800)
        self.setStyleSheet(DARK_THEME_QSS)
        
        main_widget = QWidget()
        main_layout = QHBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        from PyQt5.QtWidgets import QStackedWidget
        self.stack = QStackedWidget()
        
        self.dashboard_page = ContentArea(on_upload=self.handle_upload, on_history=self.handle_history) # 0
        self.equipment_page = EquipmentPage() # 1
        self.analytics_page = AnalyticsPage() # 2
        self.reports_page = ReportsPage()   # 3

        self.stack.addWidget(self.dashboard_page)
        self.stack.addWidget(self.equipment_page)
        self.stack.addWidget(self.analytics_page)
        self.stack.addWidget(self.reports_page)
        
        self.sidebar = Sidebar(on_nav_change=self.stack.setCurrentIndex)
        
        main_layout.addWidget(self.sidebar)
        main_layout.addWidget(self.stack)
        
        main_widget.setLayout(main_layout)
        self.setCentralWidget(main_widget)
        
        self.data = []
        self.upload_history = [] # List of {filename, data, date}

    def handle_upload(self):
        fname, _ = QFileDialog.getOpenFileName(self, 'Open PV file', '.', "CSV files (*.csv)")
        if fname:
            try:
                # 1. Data Handling with Pandas (Tech Stack Requirement)
                import pandas as pd
                df = pd.read_csv(fname)
                
                # Normalize columns for our UI
                df.columns = [c.strip().lower() for c in df.columns]
                # Map common variations to standard keys
                rename_map = {}
                for col in df.columns:
                    if 'name' in col: rename_map[col] = 'name'
                    elif 'type' in col: rename_map[col] = 'type'
                    elif 'flow' in col: rename_map[col] = 'flow'
                    elif 'press' in col: rename_map[col] = 'pressure'
                    elif 'status' in col: rename_map[col] = 'status'
                    elif 'temp' in col: rename_map[col] = 'temp'
                
                df = df.rename(columns=rename_map)
                
                # Fill missing keys to avoid KeyErrors
                expected_keys = ['name', 'type', 'flow', 'pressure', 'status', 'temp']
                for k in expected_keys:
                    if k not in df.columns:
                        df[k] = ''
                
                # Convert to list of dicts for UI update
                self.data = df.to_dict('records')

                # --- Status Logic Application (Match Web App) ---
                for row in self.data:
                    # Parse values
                    try:
                        p = float(row.get('pressure', 0) or 0)
                    except: p = 0
                    try:
                        t = float(row.get('temp', 0) or 0)
                    except: t = 0
                    
                    status = row.get('status', '')
                    
                    # Logic: If status missing or numeric (from bad CSV parse), calculate it
                    is_numeric_status = False
                    try:
                        float(status)
                        is_numeric_status = True
                    except:
                        pass

                    if not status or is_numeric_status or status.lower() not in ['stable', 'warning', 'critical']:
                        if p > 15 or t > 130:
                            row['status'] = 'Critical'
                        elif p > 9 or t > 115:
                            row['status'] = 'Warning'
                        else:
                            row['status'] = 'Stable'
                
                # Store in history
                from datetime import datetime
                entry = {
                    'filename': fname.split('/')[-1],
                    'date': datetime.now().strftime("%I:%M %p"),
                    'data': self.data,
                    'summary': f"Items: {len(self.data)}"
                }
                self.upload_history.insert(0, entry)
                self.upload_history = self.upload_history[:5]

                self.refresh_ui()
                
                # 2. Upload to Backend (Tech Stack Requirement: Django + DRF)
                # We perform this asynchronously or just let it finish since it's local
                try:
                    success, msg = firebase.upload_dataset(fname.split('/')[-1], fname, self.data)
                    if success:
                        QMessageBox.information(self, "Success", f"Uploaded to Firebase: {msg}")
                    else:
                        QMessageBox.warning(self, "Upload Error", f"Local load success, but cloud upload failed: {msg}")
                except Exception as req_err:
                     QMessageBox.warning(self, "Error", f"Upload exception: {str(req_err)}")

            except Exception as e:
                import sys
                error_msg = f"Could not process file: {str(e)}\n\nPython Path: {sys.executable}"
                QMessageBox.critical(self, "Error", error_msg)

    def refresh_ui(self):
        # Update all pages with local data (Responsive Workflow)
        self.dashboard_page.update_data(self.data)
        self.equipment_page.update_data(self.data)
        self.analytics_page.update_data(self.data)
        self.reports_page.update_data(self.data)

    def handle_history(self):
        # Fetch fresh history from Firebase
        self.upload_history = firebase.fetch_history()

        if not self.upload_history:
            QMessageBox.information(self, "History", "No upload history available.")
            return
            
        from PyQt5.QtWidgets import QDialog, QListWidget
        d = QDialog(self)
        d.setWindowTitle("Recent Uploads (Last 5)")
        d.setMinimumWidth(400)
        d.setStyleSheet("background-color: #1a1d21; color: white;")
        layout = QVBoxLayout(d)
        
        list_widget = QListWidget()
        list_widget.setStyleSheet("border: 1px solid #374151; font-size: 14px;")
        
        for item in self.upload_history:
            list_widget.addItem(f"{item['date']} - {item['filename']} ({item['summary']})")
            
        layout.addWidget(list_widget)
        
        restore_btn = QPushButton("Restore Selected")
        restore_btn.setStyleSheet("""
            background-color: #2563eb; color: white; padding: 10px; border-radius: 6px;
        """)
        restore_btn.clicked.connect(lambda: self.restore_history(list_widget.currentRow(), d))
        layout.addWidget(restore_btn)
        
        d.exec_()
        
    def restore_history(self, index, dialog):
        if index < 0: return
        entry = self.upload_history[index]
        self.data = entry['data']
        self.refresh_ui()
        dialog.accept()
        QMessageBox.information(self, "Restored", f"Restored data from {entry['filename']}")

if __name__ == "__main__":
    from PyQt5.QtGui import QColor
    app = QApplication(sys.argv)
    
    # Login Flow
    login = LoginDialog()
    if login.exec_() == QDialog.Accepted:
        window = MainWindow()
        window.show()
        sys.exit(app.exec_())
    else:
        sys.exit(0)

