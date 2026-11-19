-- INC-2093 Database Writer (SQL mode)
-- Upsert: update the existing order (DC, CA, XO, resend); insert if it is new (NW)
UPDATE HL7_PharmacyOrders
SET order_control = ${order_control},
    order_status  = ${order_status},
    message_id    = ${message_id},
    dose          = ${dose},
    dose_unit     = ${dose_unit},
    frequency     = ${frequency},
    route         = ${route},
    dispense_qty  = ${dispense_qty},
    filler_order  = ${filler_order},
    location      = ${location}
WHERE placer_order = ${placer_order} AND mrn = ${mrn};

IF @@ROWCOUNT = 0
INSERT INTO HL7_PharmacyOrders
(message_id, order_control, placer_order, filler_order, mrn, patient_name, location,
 ndc_code, drug_name, dose, dose_unit, dosage_form, frequency, route, dispense_qty,
 ordering_provider, provider_npi, ordered_at, order_status)
VALUES
(${message_id}, ${order_control}, ${placer_order}, ${filler_order}, ${mrn}, ${patient_name}, ${location},
 ${ndc_code}, ${drug_name}, ${dose}, ${dose_unit}, ${dosage_form}, ${frequency}, ${route}, ${dispense_qty},
 ${ordering_provider}, ${provider_npi}, CAST(${ordered_at} AS DATETIME2), ${order_status});
