fix(auth): improve auth pages responsiveness and skeleton accuracy

- Fix mobile overflow caused by min-h-dvh + flex-1 conflict in layout
- Move Suspense inside card so skeleton only mirrors form fields
- Rewrite AuthSkeleton to match LoginForm/RegisterForm exactly
- Increase password toggle button touch targets to 44x44px minimum
- Fix illegible font sizes on mobile (text-[10px] -> text-xs)
- Improve light mode contrast (bg-card/40 -> bg-card/80)
- Remove dead CSS classes (transition-premium, animate-premium-in)
- Update components-list.md with auth component review results
