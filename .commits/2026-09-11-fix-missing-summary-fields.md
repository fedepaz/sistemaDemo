fix(frontend): add summaryFields to mezcla and sustrato consumers

Missed two consumers that also pass confirm prop to SlideOverForm.
SummaryFields is required on ConfirmConfig, causing build errors.
