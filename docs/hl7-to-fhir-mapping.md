# HL7 v2 → FHIR R4 Mapping

Field-level mappings used by the transformers in [`transformers/fhir`](../transformers/fhir).
Identifier systems use the reserved `example.org` domain for test data.

## PID → Patient
| HL7 v2 | Example | FHIR Patient | Rule |
|---|---|---|---|
| PID.3 (repeat where PID.3.5 = MR) | `9050^^^TESTHOSP^MR` | `identifier` (system `http://testhosp.example.org/mrn`) | Select by identifier type, never by position. Repeats with type SS are not sent |
| PID.5.1 / PID.5.2 | `Ofori^Abena` | `name.family` / `name.given[]` | Structured parts, not just display text |
| PID.7 | `19920814` | `birthDate` | `substr(0,8)` then `yyyyMMdd` → `yyyy-MM-dd`; omitted if empty |
| PID.8 | `F` | `gender` | M → male, F → female, O → other, U → unknown |
| PID.19 | SSN | *(not mapped)* | PHI minimization |

## PV1 → Encounter
| HL7 v2 | Example | FHIR Encounter | Rule |
|---|---|---|---|
| PV1.19 | `V77050` | `identifier` (system `http://testhosp.example.org/visit`) | Conditional PUT key |
| PV1.2 | `O` | `class` (v3-ActCode) | I → IMP, O → AMB, E → EMER |
| MSH.9.2 | `A01` / `A03` | `status` | A03 → finished; otherwise in-progress |
| PV1.3.1–3 | `CLINIC2^107^1` | `location.location.display` | Display only (no Location resource on the server) |
| PV1.7 | `5678^Smith^Robert` | `participant.individual` | `.1` → identifier, `.3 + .2` → display |
| PV1.44 / PV1.45 | `20261105083000` | `period.start` / `period.end` | `yyyyMMddHHmmss` → `yyyy-MM-ddTHH:mm:ss` + facility offset |
| PID | | `subject` | Reference to the Patient entry (`urn:uuid`) |

## ORC + OBR (ORM^O01) → ServiceRequest
| HL7 v2 | Example | FHIR ServiceRequest | Rule |
|---|---|---|---|
| ORC.1 | `NW` | `status` / `intent` | NW → active / order (CA → revoked) |
| ORC.2.1 | `ORD5002` | `identifier` (type PLAC, system `http://testhosp.example.org/order`) | Conditional PUT key |
| OBR.4 | `58410-2^CBC panel…^LN` | `code` (LOINC) | |
| ORC.9 | `20261105084500` | `authoredOn` | dateTime with offset |
| ORC.12.2 / .3 | `Smith` / `Robert` | `requester.display` | |
| PID / PV1 | | `subject` / `encounter` | References to the Patient and Encounter entries |

## OBR (ORU^R01) → DiagnosticReport
| HL7 v2 | Example | FHIR DiagnosticReport | Rule |
|---|---|---|---|
| OBR.3.1 | `LAB30002` | `identifier` (system `http://mirthlab.example.org/report`) | Filler (lab) number |
| OBR.2.1 | `ORD5002` | `basedOn` | Reference to the ServiceRequest |
| OBR.4 | `58410-2` | `code` | |
| OBR.25 | `F` | `status` | F → final, P → preliminary, C → corrected |
| OBR.7 / OBR.22 | | `effectiveDateTime` / `issued` | |
| each OBX | | `result[]` | References to each Observation entry |

## OBX → Observation (one per OBX)
| HL7 v2 | Example | FHIR Observation | Rule |
|---|---|---|---|
| OBR.3 + OBX.3.1 | `LAB30002-718-7` | `identifier` | Unique per result, so corrected results update the same Observation |
| OBX.3 | `718-7^Hemoglobin^LN` | `code` (LOINC) | |
| OBX.5 + OBX.6 | `10.8`, `g/dL` | `valueQuantity` (UCUM) | `parseFloat` so the value is a number |
| OBX.7 | `12.0-15.5` | `referenceRange.low` / `.high` | Only when the range is `low-high` |
| OBX.8 | `L` | `interpretation` (v3-ObservationInterpretation) | Only when a flag is present |
| OBX.11 | `F` | `status` | |
| — | | `category` | `laboratory` |

## Bundle pattern
- `Bundle.type = transaction`, POSTed to the server base URL.
- Each entry: `fullUrl` (`urn:uuid:…`), `resource`, `request` (`PUT` + `Resource?identifier=system|value`).
- Resources reference each other by `urn:uuid`; the server replaces them with real ids.
- `JSON.stringify` builds the body, which escapes special characters in names automatically.
