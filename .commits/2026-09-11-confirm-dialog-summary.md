feat(slide-over-form): add form data summary to confirmation dialogs

Add summaryFields: string[] to ConfirmConfig. When non-empty, AlertDialog
renders a summary table with field labels and formatted values before
submitting. Uses existing formatShortDate and fieldLabels. Also updates
extendido select to show codigo-nombre and fixes ubicacion label.
