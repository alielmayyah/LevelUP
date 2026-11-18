# LevelUP — Core Feature List

LevelUP is a white-label gym member app for tracking body composition and personal goals. The frontend demo uses mock data. Live gym data depends on the separate backend.

## Features

| Area | Scope |
| --- | --- |
| Entry | Animated splash, onboarding slides, and sign-in with a numeric Fit ID from the front desk. Repeated attempts are rate-limited. |
| Home | Personalized greeting, private 0–100 FitScore number, next step from the latest scan, and a card for an active personal goal. The notification bell opens scan and goal updates with mark-as-read controls. |
| Progress | Full body composition results, scan comparisons, and weight, muscle, and body-fat trends. |
| Goals | Members set their own weight, muscle, and body-fat targets. The Goals tab shows active and completed goals. |
| Profile | Name, Fit ID, age, height, portrait editor, and Trophy Room with medal unlock celebrations. Settings include language, theme, sound, and sign-out. |
| Avatar | Front-facing cartoon portraits with skin, eye, hair, and outfit options, plus a separately colored hijab. See the [avatar handoff](docs/avatar-handoff.md). |
| Platform | Floating Home, Progress, Goals, and Profile tabs. Egyptian Arabic (RTL), English, light and dark themes, and gym branding. |
| Backend integration | Separate `levelup-backend` repo for the live API. The pilot requires member records and staff scan intake. |
