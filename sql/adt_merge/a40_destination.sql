-- Database Writer (Use JavaScript = No)
-- 1. The merge: re-point results from the retired MRN to the surviving MRN, remembering the old one
UPDATE HL7_LabResults
SET original_mrn = COALESCE(original_mrn, mrn),
    mrn = ${surviving_mrn}
WHERE mrn = ${retired_mrn};

-- 2. The audit log
INSERT INTO HL7_PatientMerges (message_id, surviving_mrn, retired_mrn, patient_name, merged_by, event_time)
VALUES (${message_id}, ${surviving_mrn}, ${retired_mrn}, ${patient_name}, ${merged_by}, CAST(${event_time} AS DATETIME2));
