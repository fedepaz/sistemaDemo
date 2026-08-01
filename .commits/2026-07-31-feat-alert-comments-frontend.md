feat(alerts): add frontend alert comments with compact view form

- alertCommentsService, useAlertComments, useAlertCommentsMutation hooks
- AlertsViewForm with compact 4-col spec grid + type-specific detail rows
- AlertEditForm with FormField/Textarea and character counter
- AlertsDataTable owns SlideOverForm with view/edit modes
- AlertBaseDto base schema, all 4 DTOs extend it
- queryKeys + invalidation map integration
- 7 tests (5 service + 2 hooks)
