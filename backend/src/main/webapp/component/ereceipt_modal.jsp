<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- Iryotek Official Appointment & Prescription E-Receipt Modal -->
<div class="modal fade" id="iryotekReceiptModal" tabindex="-1" aria-labelledby="receiptModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style="max-width: 860px;">
    <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
      <!-- Modal Action Bar (Hidden in Print) -->
      <div class="modal-header border-0 bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center d-print-none">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-5">📄</span>
          <div>
            <h6 class="modal-title fw-bold mb-0" id="receiptModalLabel">Official Appointment & Prescription E-Receipt</h6>
            <small class="text-white-50">Official receipt with doctor clinical prescription & verification barcode</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-light fw-bold px-3 py-2 rounded-pill shadow-sm" onclick="printReceiptArea()">
            <i class="fa-solid fa-print me-1"></i> Print / Save as PDF
          </button>
          <button type="button" class="btn btn-sm btn-outline-light rounded-circle px-2" data-bs-dismiss="modal" aria-label="Close" style="width: 32px; height: 32px; line-height: 1;">
            ✕
          </button>
        </div>
      </div>

      <!-- Printable E-Receipt Body -->
      <div class="modal-body p-4 bg-light" id="printableReceiptArea">
        <div class="card border border-2 border-primary-subtle shadow-sm rounded-4 overflow-hidden bg-white">
          <!-- Receipt Header -->
          <div class="p-4 text-white" style="background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0f766e 100%);">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-white rounded-3 p-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 52px; height: 52px;">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0e7490" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
                  </svg>
                </div>
                <div>
                  <h3 class="fw-bolder mb-0 text-white tracking-tight" style="font-size: 26px; letter-spacing: -0.5px;">Iryotek</h3>
                  <div class="text-white fw-bold fs-7" style="opacity: 0.95;">Smart Hospital System</div>
                  <div class="text-white-50 fs-8">Queueless Healthcare for Everyone</div>
                </div>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-white-20 text-white border border-white-50 rounded-pill px-3 py-2 fs-8 fw-semibold" style="backdrop-filter: blur(4px); background: rgba(255,255,255,0.2);">
                  Book Appointments
                </span>
                <span class="badge bg-white-20 text-white border border-white-50 rounded-pill px-3 py-2 fs-8 fw-semibold" style="backdrop-filter: blur(4px); background: rgba(255,255,255,0.2);">
                  Skip Waiting Lines
                </span>
                <span class="badge bg-white-20 text-white border border-white-50 rounded-pill px-3 py-2 fs-8 fw-semibold" style="backdrop-filter: blur(4px); background: rgba(255,255,255,0.2);">
                  Smart Healthcare
                </span>
              </div>
            </div>
          </div>

          <!-- Title Bar -->
          <div class="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 class="fw-bold mb-0 text-dark tracking-wide" style="font-size: 17px; letter-spacing: 0.5px;">APPOINTMENT RECEIPT</h5>
              <div class="text-muted fs-8" id="receiptIssuedOn">Official e-Receipt · Verified Booking Token</div>
            </div>
            <div class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold fs-7">
              <i class="fa-solid fa-circle-check me-1"></i> Appointment Confirmed: Your slot has been successfully booked.
            </div>
          </div>

          <!-- Receipt Main Grid -->
          <div class="p-4">
            <div class="row g-4">
              <!-- Left Column: Appointment Details -->
              <div class="col-lg-6">
                <div class="p-3 rounded-4 border h-100" style="background: #f8fafc; border-color: #e2e8f0 !important;">
                  <h6 class="fw-bold text-uppercase fs-8 text-secondary mb-3 d-flex align-items-center gap-2">
                    <span class="p-1 rounded bg-primary-subtle text-primary"><i class="fa-solid fa-user-doctor"></i></span>
                    Appointment Details
                  </h6>
                  <div class="d-flex flex-column gap-2 fs-7">
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Patient Name:</span>
                      <strong class="text-dark" id="rcptPatientName">Chinmay Prakash Rout</strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Patient ID:</span>
                      <span class="font-monospace text-secondary fw-semibold" id="rcptPatientId">PAT-2026-9042</span>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Doctor Name:</span>
                      <strong class="text-primary" id="rcptDoctorName">Dr. Sarah Jenkins</strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Department:</span>
                      <span class="text-dark fw-semibold" id="rcptDepartment">Cardiology</span>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Appointment Date:</span>
                      <strong class="text-dark" id="rcptApptDate">Tomorrow, 10:30 AM</strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Appointment Time:</span>
                      <strong class="text-dark" id="rcptApptTime">10:30 AM</strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom border-light">
                      <span class="text-muted">Consultation Type:</span>
                      <span class="badge bg-light text-primary border" id="rcptType">In-Person (OPD)</span>
                    </div>
                    <div class="d-flex justify-content-between py-1">
                      <span class="text-muted">Hospital / Clinic:</span>
                      <div class="text-end">
                        <strong class="text-dark d-block" id="rcptHospital">Iryotek Super Speciality Hospital</strong>
                        <small class="text-muted" id="rcptHospitalAddress">Central Medical Enclave, Sector 12</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Queue & Payment Details -->
              <div class="col-lg-6 d-flex flex-column gap-3">
                <!-- Queue Information Card -->
                <div class="p-3 rounded-4 border" style="background: #ecfdf5; border-color: #a7f3d0 !important;">
                  <h6 class="fw-bold text-uppercase fs-8 text-success mb-2 d-flex align-items-center gap-2">
                    <span class="p-1 rounded bg-white text-success"><i class="fa-solid fa-users-line"></i></span>
                    Queue Information
                  </h6>
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <span class="fs-8 text-success-emphasis d-block">YOUR TOKEN / QUEUE NUMBER</span>
                      <div class="display-6 fw-bolder text-success font-monospace" id="rcptQueueToken">A-015</div>
                    </div>
                    <div class="text-end">
                      <span class="fs-8 text-muted d-block">Estimated Reporting Time</span>
                      <strong class="text-dark fs-7" id="rcptReportingTime">10:15 AM (15 min prior)</strong>
                    </div>
                  </div>
                  <div class="mt-2 pt-2 border-top border-success-subtle fs-8 text-success d-flex align-items-center gap-2">
                    <span>⚡</span>
                    <span>Queueless OPD: Track your live token progress in your Patient Portal anytime.</span>
                  </div>
                </div>

                <!-- Payment Details Card -->
                <div class="p-3 rounded-4 border" style="background: #f8fafc; border-color: #e2e8f0 !important;">
                  <h6 class="fw-bold text-uppercase fs-8 text-secondary mb-2 d-flex align-items-center gap-2">
                    <span class="p-1 rounded bg-light text-dark"><i class="fa-solid fa-receipt"></i></span>
                    Payment Details
                  </h6>
                  <div class="d-flex flex-column gap-1 fs-7">
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Consultation Fee:</span>
                      <span class="text-dark" id="rcptFee">₹500.00</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Platform Service Charge:</span>
                      <span class="text-success fw-semibold">₹0.00 (Waived)</span>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-top border-bottom my-1">
                      <strong class="text-dark">Total Amount Paid:</strong>
                      <strong class="text-success fs-6" id="rcptTotalPaid">₹500.00</strong>
                    </div>
                    <div class="d-flex justify-content-between fs-8 text-muted">
                      <span>Payment Method: <strong class="text-dark" id="rcptMethod">UPI / Net Banking</strong></span>
                      <span>UTR: <span class="font-monospace text-secondary" id="rcptUtr">UPI-IRY-839210</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Doctor Prescription Details (Rendered if available) -->
            <div id="rcptPrescriptionSection" class="mt-4 pt-3 border-top">
              <div class="p-3 rounded-4 border border-info-subtle" style="background: #f0fdfa;">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <h6 class="fw-bold text-uppercase fs-8 text-cyan mb-0 d-flex align-items-center gap-2" style="color: #0e7490;">
                    <span class="fs-6">℞</span> Doctor Prescription & Treatment Plan
                  </h6>
                  <span class="badge bg-white text-cyan border border-info-subtle rounded-pill px-3 py-1 fs-8 fw-semibold" style="color: #0e7490;">
                    ✓ Digitally Signed & NMC Verified
                  </span>
                </div>

                <div class="mb-2 fs-7" id="rcptDiagnosisWrapper">
                  <span class="text-muted">Diagnosis / Indication: </span>
                  <strong class="text-dark" id="rcptDiagnosis">Routine Health Checkup & OPD Consultation</strong>
                </div>

                <div class="table-responsive rounded-3 bg-white border mt-2">
                  <table class="table table-sm align-middle mb-0 fs-7" style="width: 100%;">
                    <thead style="background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b;">
                      <tr>
                        <th class="py-2 px-3">#</th>
                        <th class="py-2 px-3">Medicine Name</th>
                        <th class="py-2 px-3">Dosage & Frequency</th>
                        <th class="py-2 px-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody id="rcptMedsTableBody">
                      <tr>
                        <td class="px-3 py-2 text-muted">1</td>
                        <td class="px-3 py-2 fw-semibold text-dark">Paracetamol 650mg</td>
                        <td class="px-3 py-2">1 tablet · Twice a day</td>
                        <td class="px-3 py-2 text-muted">Take after meals</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mt-2 pt-2 border-top border-info-subtle fs-8 text-secondary" id="rcptRemarksWrapper">
                  <strong>Clinical Remarks / Dietary Advice: </strong>
                  <span id="rcptRemarks">Drink plenty of water and follow up if symptoms persist.</span>
                </div>
              </div>
            </div>

            <!-- Bottom Section: Instructions + QR Code & Barcode -->
            <div class="row g-4 mt-1 pt-2 border-top">
              <!-- Important Instructions -->
              <div class="col-md-7">
                <h6 class="fw-bold text-uppercase fs-8 text-secondary mb-3 d-flex align-items-center gap-2">
                  <span class="p-1 rounded bg-light text-dark"><i class="fa-solid fa-circle-info"></i></span>
                  Important Instructions
                </h6>
                <ol class="ps-3 mb-0 fs-8 text-secondary d-flex flex-column gap-2" style="line-height: 1.5;">
                  <li>Please arrive at the clinic <strong>15 minutes</strong> prior to your scheduled reporting time.</li>
                  <li>Present this <strong>digital E-receipt or Token Number</strong> at the reception/kiosk upon arrival.</li>
                  <li>Live token tracking is available on your mobile device via the Iryotek Patient Portal.</li>
                  <li>For rescheduling or queries, reach 24/7 patient support at <strong>support@iryotek.health</strong>.</li>
                </ol>
              </div>

              <!-- QR Code & Barcode -->
              <div class="col-md-5 d-flex flex-column align-items-center justify-content-center text-center p-3 rounded-4 bg-light border">
                <div class="fs-8 fw-bold text-uppercase text-muted mb-2">Check-in QR Code</div>
                <div class="bg-white p-2 rounded-3 border shadow-sm mb-2" id="rcptQrBox">
                  <!-- SVG Mock QR Code -->
                  <svg width="90" height="90" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff"/>
                    <rect x="10" y="10" width="30" height="30" fill="#0e7490"/>
                    <rect x="16" y="16" width="18" height="18" fill="#ffffff"/>
                    <rect x="20" y="20" width="10" height="10" fill="#0e7490"/>
                    <rect x="60" y="10" width="30" height="30" fill="#0e7490"/>
                    <rect x="66" y="16" width="18" height="18" fill="#ffffff"/>
                    <rect x="70" y="20" width="10" height="10" fill="#0e7490"/>
                    <rect x="10" y="60" width="30" height="30" fill="#0e7490"/>
                    <rect x="16" y="66" width="18" height="18" fill="#ffffff"/>
                    <rect x="20" y="70" width="10" height="10" fill="#0e7490"/>
                    <rect x="46" y="14" width="8" height="8" fill="#0e7490"/>
                    <rect x="46" y="28" width="8" height="8" fill="#0e7490"/>
                    <rect x="14" y="46" width="8" height="8" fill="#0e7490"/>
                    <rect x="28" y="46" width="8" height="8" fill="#0e7490"/>
                    <rect x="46" y="46" width="8" height="8" fill="#0e7490"/>
                    <rect x="60" y="46" width="8" height="8" fill="#0e7490"/>
                    <rect x="74" y="46" width="8" height="8" fill="#0e7490"/>
                    <rect x="46" y="60" width="8" height="8" fill="#0e7490"/>
                    <rect x="60" y="60" width="8" height="8" fill="#0e7490"/>
                    <rect x="74" y="60" width="8" height="8" fill="#0e7490"/>
                    <rect x="46" y="74" width="8" height="8" fill="#0e7490"/>
                    <rect x="60" y="74" width="8" height="8" fill="#0e7490"/>
                    <rect x="74" y="74" width="8" height="8" fill="#0e7490"/>
                  </svg>
                </div>
                <div class="font-monospace fs-8 text-secondary fw-bold" id="rcptBarcodeText">APPT-IRY-2026-A015</div>
                <small class="text-muted fs-8">Scan at hospital kiosk for instant queue verification</small>
              </div>
            </div>
          </div>

          <!-- Receipt Footer -->
          <div class="px-4 py-3 bg-light border-top text-center text-muted fs-8">
            <div>Iryotek – Smart Hospital System | Queueless Healthcare for a Smarter Tomorrow</div>
            <div class="text-muted-50" style="font-size: 10px;">This is a computer-generated official electronic receipt. No physical signature required.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printableReceiptArea, #printableReceiptArea * {
    visibility: visible;
  }
  #printableReceiptArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: transparent !important;
  }
  .modal-dialog {
    max-width: 100% !important;
    margin: 0 !important;
  }
  .modal-content {
    border: none !important;
    box-shadow: none !important;
  }
  .d-print-none {
    display: none !important;
  }
}
</style>

<script>
function openEReceiptModal(patientName, patientId, docName, specialty, apptDate, apptTime, tokenNo, fee, diseases, remarks, medicines) {
  try {
    if (patientName) document.getElementById('rcptPatientName').textContent = patientName;
    if (patientId) document.getElementById('rcptPatientId').textContent = patientId;
    if (docName) document.getElementById('rcptDoctorName').textContent = docName;
    if (specialty) document.getElementById('rcptDepartment').textContent = specialty;
    if (apptDate) document.getElementById('rcptApptDate').textContent = apptDate;
    if (apptTime) {
      document.getElementById('rcptApptTime').textContent = apptTime;
      document.getElementById('rcptReportingTime').textContent = apptTime + ' (15 min prior)';
    }
    if (tokenNo) {
      document.getElementById('rcptQueueToken').textContent = tokenNo;
      document.getElementById('rcptBarcodeText').textContent = 'APPT-IRY-' + tokenNo;
    }
    if (fee) {
      document.getElementById('rcptFee').textContent = '₹' + fee + '.00';
      document.getElementById('rcptTotalPaid').textContent = '₹' + fee + '.00';
    }
    if (diseases) {
      document.getElementById('rcptDiagnosis').textContent = diseases;
    }
    if (remarks) {
      document.getElementById('rcptRemarks').textContent = remarks;
    }

    if (medicines && Array.isArray(medicines) && medicines.length > 0) {
      var tbody = document.getElementById('rcptMedsTableBody');
      tbody.innerHTML = '';
      medicines.forEach(function(med, i) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td class="px-3 py-2 text-muted">' + (i + 1) + '</td>' +
                       '<td class="px-3 py-2 fw-semibold text-dark">' + (med.name || 'Medicine') + '</td>' +
                       '<td class="px-3 py-2">' + (med.dosage || med.dose || 'As directed') + '</td>' +
                       '<td class="px-3 py-2 text-muted">' + (med.instructions || 'Follow doctor advice') + '</td>';
        tbody.appendChild(tr);
      });
      document.getElementById('rcptPrescriptionSection').style.display = 'block';
    }

    var myModal = new bootstrap.Modal(document.getElementById('iryotekReceiptModal'));
    myModal.show();
  } catch (err) {
    console.error('Error opening E-Receipt modal:', err);
  }
}

function printReceiptArea() {
  try {
    var area = document.getElementById('printableReceiptArea');
    if (!area) {
      window.print();
      return;
    }
    var printWin = window.open('', '_blank', 'width=900,height=900');
    if (printWin) {
      printWin.document.write('<!DOCTYPE html><html><head><title>Iryotek Appointment Receipt</title>' +
        '<meta charset="utf-8">' +
        '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' +
        '<style>body{padding:24px;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}@media print{body{padding:0;}}</style>' +
        '</head><body><div style="max-width:840px;margin:0 auto;">' + area.innerHTML + '</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>');
      printWin.document.close();
    } else {
      window.print();
    }
  } catch (e) {
    window.print();
  }
}
</script>
