# Security Specification - Doctors, Medicines, and Lab Packages

## Data Invariants
1. Doctors, Medicines, and Lab Packages are system entities managed solely by administrators.
2. Patients and Doctors can read these entities to discover services.
3. IDs must be valid strings.
4. Prices and Stock must be non-negative.
5. Timestamps use ISO strings (as per existing codebase pattern).

## The "Dirty Dozen" Payloads (Red Team)
1. **Unauthenticated Doctor Create**: Attempting to add a doctor without being signed in.
2. **Anonymous Doctor Delete**: Attempting to delete a doctor collection as an anonymous user.
3. **Patient Medicine Update**: A patient trying to change the price of a medicine.
4. **Doctor Lab Package Create**: A doctor trying to add a new lab package.
5. **Admin Identity Spoofing**: A user trying to set their own role to 'admin' in a profile update.
6. **Medicine Shadow Field**: Adding a `discountCode: "ALL_FREE"` to a medicine document.
7. **Lab Package Parameter Injection**: Injecting a extremely large array into the parameters field of a lab package.
8. **Invalid ID Poisoning**: Creating a document with an ID containing control characters.
9. **Price Negative Injection**: Setting a medicine price to -100.
10. **Stock Overflow**: Setting stock to an astronomical number to crash client-side calculations.
11. **PII Leak Attempt**: A patient trying to read the entire admin collection (if it existed, but here we check for broad read access).
12. **Status Shortcutting**: A user trying to set a lab booking directly to 'completed' on creation.

## The Test Runner (Conceptual)
All the above should return `PERMISSION_DENIED`.
