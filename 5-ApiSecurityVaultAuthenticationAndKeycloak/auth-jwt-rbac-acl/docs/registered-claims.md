# Registered Claims

Registered claims are a set of standardized fields that can be used to convey common information between systems using JWT.

Below are the most common registered claims, which can be used to ensure the integrity and security of JWT tokens.

| Abbreviation | Full Name         | Data Type    | Reason for Use |
|--------------|-------------------|--------------|----------------|
| `iss`        | Issuer            | String       | Ensures authenticity by identifying who issued the token. Allows the recipient to validate if the token came from a trusted source. |
| `sub`        | Subject           | String       | Defines for whom the token was issued. Essential for associating the token with a specific user or entity. |
| `aud`        | Audience          | String/Array | Restricts the token's use to specific systems, preventing a token valid for one service from being improperly accepted by another. |
| `exp`        | Expiration Time   | Integer      | Prevents reuse of old tokens and reduces session hijacking risks. Defines a maximum validity time for the token. |
| `nbf`        | Not Before        | Integer      | Prevents the token from being used before a certain date/time, useful for scheduled access control or temporary revocations. |
| `iat`        | Issued At         | Integer      | Allows systems to determine the token's age, useful for checking if a token is still valid within an acceptable time window. |
| `jti`        | JWT ID            | String       | Ensures token uniqueness, helping to prevent replay attacks by storing and validating already used tokens. |