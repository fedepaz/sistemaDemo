fix(ui): correct header centering and layout padding for large screens

- Replace container mx-auto with w-full on dashboard and auth headers
- Add md:px-3 step to layout padding ramp for smoother density
- Remove redundant max-w-[1600px] and px-1 from RootDashboard
