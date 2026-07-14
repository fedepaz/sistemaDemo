style(alerts): polish touch targets, inputs, and layout

- Increase filter tab touch targets on mobile (py-2) and badge text (11px)
- Add overflow-x-auto scroll for filter tabs on narrow screens
- Remove unnecessary cursor-default on summary cards
- Conditionally hide empty AlertSection in V1 (cleaner demo)
- Replace raw inputs with shadcn Input component (consistency)
- Add htmlFor/id association to form labels (accessibility)
- Replace × character with lucide X icon in NotificationCenter
- Fix dismiss button visibility on touch devices (opacity on sm: only)
- Add cursor-pointer to subpartidas toggle and "+" buttons
