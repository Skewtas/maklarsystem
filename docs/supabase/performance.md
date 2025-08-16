### Prestanda & Kostnad

- **Indexering**
  - FK-index på relationsfält (tillämpat via migration 20250808_add_fk_indexes)
  - Ta bort dubbletter/oinformerade index (20250808_drop_duplicate_user_indexes, 20250808_cleanup_duplicate_indexes, 20250808_drop_low_value_indexes)

- **Frågemönster**
  - Keyset pagination när möjligt
  - Selektiv SELECT (endast nödvändiga kolumner)

- **Verifiering**
  - get_advisors(type=performance)






