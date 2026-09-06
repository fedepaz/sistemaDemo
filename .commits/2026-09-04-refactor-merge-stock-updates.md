refactor(legacy): merge stock update methods into single transactional operation

Combine updateStock and updateStockTotal into a single updateStock method
that fetches totals internally and wraps both UPDATEs (st_sem_item +
st_sem) in a transaction for atomicity.
