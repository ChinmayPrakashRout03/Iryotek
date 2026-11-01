import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle

def create_er_diagram(output_png, output_pdf):
    # Canvas setup (Ultra wide 4K aspect ratio for optimal spacing)
    fig_width = 38
    fig_height = 24
    fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Background color
    fig.patch.set_facecolor('#f8fafc')
    ax.set_facecolor('#f8fafc')

    # Color Palette by Functional Domain
    DOMAINS = {
        'CLINICAL': {'header': '#0f766e', 'sub': '#115e59', 'bg': '#ffffff', 'accent': '#14b8a6', 'border': '#0d9488', 'text_head': '#ffffff'},
        'PHARMACY': {'header': '#15803d', 'sub': '#166534', 'bg': '#ffffff', 'accent': '#22c55e', 'border': '#16a34a', 'text_head': '#ffffff'},
        'ORDERS':   {'header': '#b45309', 'sub': '#92400e', 'bg': '#ffffff', 'accent': '#f59e0b', 'border': '#d97706', 'text_head': '#ffffff'},
        'EHR_AI':   {'header': '#4338ca', 'sub': '#3730a3', 'bg': '#ffffff', 'accent': '#6366f1', 'border': '#4f46e5', 'text_head': '#ffffff'},
        'INSURANCE':{'header': '#be123c', 'sub': '#9f1239', 'bg': '#ffffff', 'accent': '#f43f5e', 'border': '#e11d48', 'text_head': '#ffffff'}
    }

    # Data structures for Entities
    # x, y, width, height, domain, title, fields: list of (is_pk, is_fk, name, type)
    entities = {
        # 1. CLINICAL CORE
        'specialist': {
            'x': 26, 'y': 84, 'w': 10, 'h': 6.5, 'domain': 'CLINICAL',
            'title': 'specialist',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, False, 'specialist_name', 'VARCHAR(100)')
            ]
        },
        'hospital': {
            'x': 39, 'y': 84, 'w': 11, 'h': 8.5, 'domain': 'CLINICAL',
            'title': 'hospital',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, False, 'name', 'VARCHAR(200)'),
                (False, False, 'city', 'VARCHAR(100)'),
                (False, False, 'state', 'VARCHAR(100)'),
                (False, False, 'phone', 'VARCHAR(20)')
            ]
        },
        'doctor': {
            'x': 32, 'y': 66, 'w': 13, 'h': 13, 'domain': 'CLINICAL',
            'title': 'doctor',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'hospitalId', 'INT (FK)'),
                (False, False, 'fullName', 'VARCHAR(100)'),
                (False, False, 'qualification', 'VARCHAR(100)'),
                (False, False, 'specialist', 'VARCHAR(100)'),
                (False, False, 'email', 'VARCHAR(100) [UK]'),
                (False, False, 'phone', 'VARCHAR(20)'),
                (False, False, 'timing', 'VARCHAR(100)')
            ]
        },
        'user_details': {
            'x': 20, 'y': 48, 'w': 12, 'h': 9.5, 'domain': 'CLINICAL',
            'title': 'user_details (patient)',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, False, 'full_name', 'VARCHAR(100)'),
                (False, False, 'email', 'VARCHAR(100) [UK]'),
                (False, False, 'password', 'VARCHAR(255) [BCrypt]')
            ]
        },
        'appointment': {
            'x': 37, 'y': 44, 'w': 13, 'h': 15, 'domain': 'CLINICAL',
            'title': 'appointment',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'userId', 'INT (FK)'),
                (False, True, 'doctorId', 'INT (FK)'),
                (False, False, 'tokenNo', 'INT'),
                (False, False, 'appointmentDate', 'VARCHAR(50)'),
                (False, False, 'appointmentTime', 'VARCHAR(50)'),
                (False, False, 'diseases', 'VARCHAR(255)'),
                (False, False, 'status', 'VARCHAR(50)'),
                (False, False, 'fullName', 'VARCHAR(100)'),
                (False, False, 'phone', 'VARCHAR(20)')
            ]
        },

        # 2. SMART PRESCRIPTIONS & PHARMACY DISPENSING
        'prescription': {
            'x': 54, 'y': 58, 'w': 13, 'h': 12, 'domain': 'PHARMACY',
            'title': 'prescription',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'appointment_id', 'INT (FK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, True, 'doctor_id', 'INT (FK)'),
                (False, False, 'status', 'VARCHAR(50)'),
                (False, False, 'remarks', 'TEXT'),
                (False, False, 'approved_at', 'TIMESTAMP')
            ]
        },
        'prescription_medicine': {
            'x': 54, 'y': 38, 'w': 13, 'h': 15, 'domain': 'PHARMACY',
            'title': 'prescription_medicine',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'prescription_id', 'INT (FK)'),
                (False, True, 'medicine_id', 'INT (FK)'),
                (False, False, 'medicine_name', 'VARCHAR(200)'),
                (False, False, 'strength', 'VARCHAR(100)'),
                (False, False, 'dosage_form', 'VARCHAR(100)'),
                (False, False, 'units_per_dose', 'DOUBLE'),
                (False, False, 'frequency', 'VARCHAR(100)'),
                (False, False, 'duration_days', 'INT'),
                (False, False, 'calculated_qty', 'INT')
            ]
        },
        'medicine': {
            'x': 71, 'y': 44, 'w': 12, 'h': 12, 'domain': 'PHARMACY',
            'title': 'medicine',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, False, 'name', 'VARCHAR(200)'),
                (False, False, 'category', 'VARCHAR(100)'),
                (False, False, 'dosage_form', 'VARCHAR(100)'),
                (False, False, 'price', 'DOUBLE'),
                (False, False, 'stock', 'INT'),
                (False, False, 'description', 'TEXT')
            ]
        },
        'pharmacy_dispensing_request': {
            'x': 70, 'y': 66, 'w': 14, 'h': 15, 'domain': 'PHARMACY',
            'title': 'pharmacy_dispensing_request',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'prescription_id', 'INT (FK)'),
                (False, True, 'medicine_id', 'INT (FK)'),
                (False, True, 'patient_id', 'INT (FK)'),
                (False, True, 'doctor_id', 'INT (FK)'),
                (False, False, 'calculated_quantity', 'INT'),
                (False, False, 'quantity_dispensed', 'INT'),
                (False, False, 'quantity_remaining', 'INT'),
                (False, False, 'status', 'VARCHAR(50)'),
                (False, False, 'idempotency_key', 'VARCHAR(100) [UK]')
            ]
        },
        'pharmacy_audit_log': {
            'x': 86, 'y': 67, 'w': 12, 'h': 13, 'domain': 'PHARMACY',
            'title': 'pharmacy_audit_log',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'dispensing_request_id', 'INT (FK)'),
                (False, True, 'medicine_id', 'INT (FK)'),
                (False, False, 'pharmacist_id', 'INT'),
                (False, False, 'action', 'VARCHAR(50)'),
                (False, False, 'quantity_dispensed', 'INT'),
                (False, False, 'previous_stock', 'INT'),
                (False, False, 'new_stock', 'INT'),
                (False, False, 'timestamp', 'TIMESTAMP')
            ]
        },

        # 3. CART & MEDICINE ORDERS
        'cart': {
            'x': 36, 'y': 28, 'w': 11, 'h': 8, 'domain': 'ORDERS',
            'title': 'cart',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT [UK] (FK)'),
                (False, False, 'updated_at', 'TIMESTAMP')
            ]
        },
        'cart_item': {
            'x': 51, 'y': 22, 'w': 12, 'h': 12, 'domain': 'ORDERS',
            'title': 'cart_item',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'cart_id', 'INT (FK)'),
                (False, True, 'medicine_id', 'INT (FK)'),
                (False, False, 'quantity', 'INT'),
                (False, False, 'dosage_instructions', 'VARCHAR(255)'),
                (False, False, 'source', "VARCHAR(50) ['RX'/'SHOP']"),
                (False, False, 'prescription_id', 'INT')
            ]
        },
        'user_address': {
            'x': 36, 'y': 14, 'w': 12, 'h': 11, 'domain': 'ORDERS',
            'title': 'user_address',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, False, 'full_name', 'VARCHAR(100)'),
                (False, False, 'phone', 'VARCHAR(20)'),
                (False, False, 'street_address', 'VARCHAR(500)'),
                (False, False, 'city', 'VARCHAR(100)'),
                (False, False, 'state', 'VARCHAR(100)'),
                (False, False, 'pincode', 'VARCHAR(20)')
            ]
        },
        'medicine_order': {
            'x': 67, 'y': 22, 'w': 13, 'h': 15, 'domain': 'ORDERS',
            'title': 'medicine_order',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, False, 'order_number', 'VARCHAR(100) [UK]'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, True, 'address_id', 'INT (FK)'),
                (False, False, 'total_amount', 'DOUBLE'),
                (False, False, 'payment_method', 'VARCHAR(50)'),
                (False, False, 'payment_status', 'VARCHAR(50)'),
                (False, False, 'order_status', 'VARCHAR(50)'),
                (False, False, 'created_at', 'TIMESTAMP')
            ]
        },
        'medicine_order_item': {
            'x': 83, 'y': 24, 'w': 13, 'h': 12, 'domain': 'ORDERS',
            'title': 'medicine_order_item',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'order_id', 'INT (FK)'),
                (False, True, 'medicine_id', 'INT (FK)'),
                (False, False, 'medicine_name', 'VARCHAR(200)'),
                (False, False, 'price', 'DOUBLE'),
                (False, False, 'quantity', 'INT'),
                (False, False, 'subtotal', 'DOUBLE')
            ]
        },

        # 4. PATIENT EHR, VITALS & AI DIAGNOSTICS
        'ai_differential_diagnosis': {
            'x': 18, 'y': 66, 'w': 12, 'h': 12, 'domain': 'EHR_AI',
            'title': 'ai_differential_diagnosis',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, True, 'appointment_id', 'INT (FK)'),
                (False, False, 'urgency_level', "VARCHAR(50) ['RED'/'YEL'/'GRN']"),
                (False, False, 'symptoms', 'TEXT'),
                (False, False, 'diagnoses_json', 'JSON/TEXT'),
                (False, False, 'clinical_notes', 'TEXT')
            ]
        },
        'patient_profile': {
            'x': 4, 'y': 71, 'w': 12, 'h': 12, 'domain': 'EHR_AI',
            'title': 'patient_profile',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, False, 'date_of_birth', 'VARCHAR(50)'),
                (False, False, 'gender', 'VARCHAR(20)'),
                (False, False, 'blood_group', 'VARCHAR(10)'),
                (False, False, 'emergency_phone', 'VARCHAR(20)'),
                (False, False, 'emergency_contact', 'VARCHAR(100)')
            ]
        },
        'patient_vitals': {
            'x': 4, 'y': 51, 'w': 13, 'h': 16, 'domain': 'EHR_AI',
            'title': 'patient_vitals (time-series)',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, False, 'recorded_date', 'VARCHAR(50)'),
                (False, False, 'heart_rate', 'INT (bpm)'),
                (False, False, 'bp_systolic', 'INT (mmHg)'),
                (False, False, 'bp_diastolic', 'INT (mmHg)'),
                (False, False, 'oxygen_saturation', 'INT (% SpO2)'),
                (False, False, 'blood_glucose', 'INT (mg/dL)'),
                (False, False, 'temperature', 'DOUBLE (°F)'),
                (False, False, 'created_at', 'TIMESTAMP')
            ]
        },
        'patient_medical_history': {
            'x': 4, 'y': 33, 'w': 13, 'h': 13, 'domain': 'EHR_AI',
            'title': 'patient_medical_history',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, False, 'category', "VARCHAR(50) ['ALLERGY'/'SURGERY']"),
                (False, False, 'title', 'VARCHAR(200)'),
                (False, False, 'diagnosed_year', 'VARCHAR(50)'),
                (False, False, 'description', 'TEXT')
            ]
        },
        'patient_document': {
            'x': 4, 'y': 17, 'w': 12, 'h': 11, 'domain': 'EHR_AI',
            'title': 'patient_document',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, False, 'document_name', 'VARCHAR(255)'),
                (False, False, 'document_type', 'VARCHAR(100)'),
                (False, False, 'file_path', 'VARCHAR(500)'),
                (False, False, 'uploaded_at', 'TIMESTAMP')
            ]
        },

        # 5. HEALTH INSURANCE & CLAIMS
        'patient_insurance': {
            'x': 19, 'y': 27, 'w': 13, 'h': 14, 'domain': 'INSURANCE',
            'title': 'patient_insurance',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, False, 'provider_name', 'VARCHAR(150)'),
                (False, False, 'policy_number', 'VARCHAR(100)'),
                (False, False, 'sum_insured', 'DOUBLE (e.g. 500k)'),
                (False, False, 'deductible_total', 'DOUBLE'),
                (False, False, 'status', 'VARCHAR(50) [ACTIVE]'),
                (False, False, 'expiry_date', 'VARCHAR(50)')
            ]
        },
        'insurance_claim': {
            'x': 19, 'y': 8, 'w': 14, 'h': 15, 'domain': 'INSURANCE',
            'title': 'insurance_claim',
            'fields': [
                (True, False, 'id', 'INT (PK)'),
                (False, False, 'claim_number', 'VARCHAR(50) [UK]'),
                (False, True, 'user_id', 'INT (FK)'),
                (False, True, 'insurance_id', 'INT (FK)'),
                (False, False, 'treatment_desc', 'VARCHAR(500)'),
                (False, False, 'total_billed_amount', 'DOUBLE'),
                (False, False, 'covered_amount', 'DOUBLE'),
                (False, False, 'patient_copay', 'DOUBLE'),
                (False, False, 'claim_status', "VARCHAR(50) ['APPROVED'/'REVIEW']")
            ]
        }
    }

    # Render Function for Table Cards
    def draw_entity(ax, ent_id, ent):
        x, y, w, h = ent['x'], ent['y'], ent['w'], ent['h']
        dom = DOMAINS[ent['domain']]

        # Main Card Shadow & Rounded Box
        shadow = FancyBboxPatch((x + 0.3, y - h - 0.3), w, h,
                                boxstyle="Round,pad=0.2,rounding_size=0.6",
                                facecolor='#cbd5e1', edgecolor='none', alpha=0.5, zorder=2)
        ax.add_patch(shadow)

        card = FancyBboxPatch((x, y - h), w, h,
                              boxstyle="Round,pad=0.2,rounding_size=0.6",
                              facecolor=dom['bg'], edgecolor=dom['border'], linewidth=1.5, zorder=3)
        ax.add_patch(card)

        # Header Box
        header_h = 2.4
        header = FancyBboxPatch((x, y - header_h), w, header_h,
                                boxstyle="Round,pad=0.2,rounding_size=0.6",
                                facecolor=dom['header'], edgecolor='none', zorder=4)
        ax.add_patch(header)
        # Flatten bottom of header
        ax.fill_between([x - 0.2, x + w + 0.2], [y - header_h, y - header_h], [y - header_h + 0.5, y - header_h + 0.5],
                        color=dom['header'], zorder=4)

        # Header Text
        ax.text(x + w/2, y - 1.2, ent['title'], ha='center', va='center',
                color=dom['text_head'], fontsize=11, fontweight='bold', family='sans-serif', zorder=5)

        # Attribute Rows
        num_fields = len(ent['fields'])
        row_space = (h - header_h - 0.8) / max(num_fields, 1)

        for i, (is_pk, is_fk, name, ftype) in enumerate(ent['fields']):
            curr_y = y - header_h - 0.6 - (i * row_space)

            # Icon badge
            if is_pk:
                ax.text(x + 0.5, curr_y, 'PK', color='#b45309', fontsize=8, fontweight='heavy', family='sans-serif', zorder=5,
                        bbox=dict(boxstyle='round,pad=0.15', facecolor='#fef3c7', edgecolor='#f59e0b', linewidth=0.7))
            elif is_fk:
                ax.text(x + 0.5, curr_y, 'FK', color='#1d4ed8', fontsize=8, fontweight='heavy', family='sans-serif', zorder=5,
                        bbox=dict(boxstyle='round,pad=0.15', facecolor='#dbeafe', edgecolor='#3b82f6', linewidth=0.7))
            else:
                ax.plot(x + 0.8, curr_y + 0.05, marker='o', markersize=3, color='#94a3b8', zorder=5)

            # Field Name
            name_weight = 'bold' if is_pk else ('semibold' if is_fk else 'normal')
            name_color = '#0f172a' if is_pk or is_fk else '#334155'
            ax.text(x + 1.8, curr_y, name, ha='left', va='center',
                    color=name_color, fontsize=8.5, fontweight=name_weight, family='sans-serif', zorder=5)

            # Data Type
            ax.text(x + w - 0.5, curr_y, ftype, ha='right', va='center',
                    color='#64748b', fontsize=7.5, family='monospace', zorder=5)

    # Draw all entities
    for ent_id, ent in entities.items():
        draw_entity(ax, ent_id, ent)

    # Relationships (Connectors)
    # from_ent, to_ent, label, cardinality, color
    relationships = [
        # Clinical
        ('doctor', 'hospital', 'belongs to', 'N : 1', '#0d9488'),
        ('appointment', 'doctor', 'attends', 'N : 1', '#0d9488'),
        ('appointment', 'user_details', 'booked by', 'N : 1', '#0d9488'),

        # Prescriptions & Pharmacy
        ('prescription', 'appointment', 'generated for', '1 : 1', '#15803d'),
        ('prescription', 'user_details', 'issued to', 'N : 1', '#15803d'),
        ('prescription', 'doctor', 'written by', 'N : 1', '#15803d'),
        ('prescription_medicine', 'prescription', 'contains', 'N : 1', '#15803d'),
        ('prescription_medicine', 'medicine', 'prescribes', 'N : 1', '#15803d'),
        ('pharmacy_dispensing_request', 'prescription', 'fulfills', 'N : 1', '#15803d'),
        ('pharmacy_dispensing_request', 'medicine', 'dispenses', 'N : 1', '#15803d'),
        ('pharmacy_audit_log', 'pharmacy_dispensing_request', 'audits', 'N : 1', '#166534'),

        # Orders & Cart
        ('cart', 'user_details', 'held by', '1 : 1', '#d97706'),
        ('cart_item', 'cart', 'items in', 'N : 1', '#d97706'),
        ('cart_item', 'medicine', 'references', 'N : 1', '#d97706'),
        ('user_address', 'user_details', 'delivery for', 'N : 1', '#d97706'),
        ('medicine_order', 'user_details', 'placed by', 'N : 1', '#d97706'),
        ('medicine_order', 'user_address', 'shipped to', 'N : 1', '#d97706'),
        ('medicine_order_item', 'medicine_order', 'order lines', 'N : 1', '#b45309'),
        ('medicine_order_item', 'medicine', 'contains', 'N : 1', '#b45309'),

        # EHR & Diagnostics
        ('patient_profile', 'user_details', 'profile of', '1 : 1', '#4f46e5'),
        ('patient_vitals', 'user_details', 'logged for', 'N : 1', '#4f46e5'),
        ('patient_medical_history', 'user_details', 'history of', 'N : 1', '#4f46e5'),
        ('patient_document', 'user_details', 'uploaded by', 'N : 1', '#4f46e5'),
        ('ai_differential_diagnosis', 'appointment', 'evaluated on', 'N : 1', '#4f46e5'),
        ('ai_differential_diagnosis', 'user_details', 'assessed for', 'N : 1', '#4f46e5'),

        # Insurance
        ('patient_insurance', 'user_details', 'policy for', '1 : 1', '#e11d48'),
        ('insurance_claim', 'patient_insurance', 'claimed under', 'N : 1', '#e11d48'),
        ('insurance_claim', 'user_details', 'filed by', 'N : 1', '#e11d48')
    ]

    def get_anchor(ent, side):
        x, y, w, h = ent['x'], ent['y'], ent['w'], ent['h']
        if side == 'top': return (x + w/2, y)
        if side == 'bottom': return (x + w/2, y - h)
        if side == 'left': return (x, y - h/2)
        if side == 'right': return (x + w, y - h/2)
        return (x + w/2, y - h/2)

    def draw_connection(src_name, dst_name, label, card, color):
        src = entities[src_name]
        dst = entities[dst_name]

        # Determine best anchors based on relative positions
        src_cx = src['x'] + src['w']/2
        src_cy = src['y'] - src['h']/2
        dst_cx = dst['x'] + dst['w']/2
        dst_cy = dst['y'] - dst['h']/2

        dx = dst_cx - src_cx
        dy = dst_cy - src_cy

        if abs(dx) > abs(dy):
            src_side = 'right' if dx > 0 else 'left'
            dst_side = 'left' if dx > 0 else 'right'
        else:
            src_side = 'top' if dy > 0 else 'bottom'
            dst_side = 'bottom' if dy > 0 else 'top'

        start = get_anchor(src, src_side)
        end = get_anchor(dst, dst_side)

        # Connection line with slight curvature
        conn_style = f"arc3,rad={0.08 if dx > 0 else -0.08}"
        arrow = patches.FancyArrowPatch(start, end,
                                        connectionstyle=conn_style,
                                        arrowstyle='-|>',
                                        mutation_scale=14,
                                        linewidth=1.4,
                                        color=color,
                                        linestyle='-',
                                        alpha=0.75,
                                        zorder=2)
        ax.add_patch(arrow)

        # Midpoint label
        mx = (start[0] + end[0]) / 2
        my = (start[1] + end[1]) / 2 + (0.4 if dy > 0 else -0.4)
        ax.text(mx, my, f"{label} ({card})", ha='center', va='center',
                fontsize=7, color=color, fontweight='bold', family='sans-serif',
                bbox=dict(boxstyle='round,pad=0.15', facecolor='#ffffff', edgecolor=color, linewidth=0.5, alpha=0.9),
                zorder=4)

    for src_name, dst_name, label, card, color in relationships:
        draw_connection(src_name, dst_name, label, card, color)

    # Header Banner
    banner = FancyBboxPatch((2, 92), 96, 6,
                            boxstyle="Round,pad=0.3,rounding_size=0.8",
                            facecolor='#0f172a', edgecolor='#1e293b', linewidth=2, zorder=6)
    ax.add_patch(banner)

    ax.text(5, 95.8, "IRYOTEK HEALTHCARE MANAGEMENT ECOSYSTEM", color='#ffffff',
            fontsize=20, fontweight='heavy', family='sans-serif', zorder=7)
    ax.text(5, 93.8, "Comprehensive Entity-Relationship (ER) Relational Database Architecture Diagram  •  MySQL 8.0 InnoDB",
            color='#94a3b8', fontsize=12, fontweight='medium', family='sans-serif', zorder=7)

    # Meta Tags in Header
    ax.text(95, 95.8, "DATABASE: hospital", ha='right', color='#38bdf8',
            fontsize=10, fontweight='bold', family='monospace', zorder=7,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='#082f49', edgecolor='#0284c7'))
    ax.text(95, 93.8, "22 Relational Entities • 100% Referential Integrity", ha='right', color='#a7f3d0',
            fontsize=9.5, fontweight='semibold', family='sans-serif', zorder=7)

    # Legend / Domain Map at Bottom
    legend_box = FancyBboxPatch((2, 1.5), 96, 4.5,
                                boxstyle="Round,pad=0.2,rounding_size=0.6",
                                facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.2, zorder=6)
    ax.add_patch(legend_box)

    ax.text(3.5, 3.8, "FUNCTIONAL DOMAIN LEGEND & CARDINALITY:", color='#0f172a',
            fontsize=10, fontweight='bold', family='sans-serif', zorder=7)

    domains_legend = [
        ('Core Clinical & Appointments', DOMAINS['CLINICAL']['header']),
        ('Smart Prescription & Dispensing', DOMAINS['PHARMACY']['header']),
        ('Pharmacy Orders & Logistics', DOMAINS['ORDERS']['header']),
        ('Patient EHR, Vitals & AI Triage', DOMAINS['EHR_AI']['header']),
        ('Health Insurance & Claims', DOMAINS['INSURANCE']['header'])
    ]

    for i, (title, col) in enumerate(domains_legend):
        lx = 27 + (i * 14.5)
        ax.add_patch(patches.Rectangle((lx, 3.3), 1.2, 0.9, facecolor=col, edgecolor='none', zorder=7))
        ax.text(lx + 1.6, 3.8, title, ha='left', va='center', color='#334155', fontsize=8.5, fontweight='semibold', zorder=7)

    # Sub-legend (PK / FK indicators)
    ax.text(3.5, 2.4, "KEYS:  [PK] Primary Key (Auto-Increment)    [FK] Foreign Key Constraint    [UK] Unique Indexed Field    CARDINALITY:  1:1 One-to-One  |  1:N One-to-Many  |  Arrow: References Target Entity",
            color='#64748b', fontsize=8, family='sans-serif', zorder=7)

    # Save to PNG and PDF
    print(f"Generating high-resolution PNG: {output_png} ...")
    plt.savefig(output_png, dpi=300, bbox_inches='tight', pad_inches=0.2)
    print(f"Generating vector PDF: {output_pdf} ...")
    plt.savefig(output_pdf, format='pdf', bbox_inches='tight', pad_inches=0.2)
    plt.close()
    print("ER Diagram successfully generated!")

if __name__ == '__main__':
    out_dir = os.path.abspath('ER')
    os.makedirs(out_dir, exist_ok=True)
    png_path = os.path.join(out_dir, 'Iryotek_ER_Diagram.png')
    pdf_path = os.path.join(out_dir, 'Iryotek_ER_Diagram.pdf')
    create_er_diagram(png_path, pdf_path)

