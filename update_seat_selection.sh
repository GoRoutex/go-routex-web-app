#!/bin/bash
sed -i '' 's/(routeData as any)/(routeData as Record<string, unknown>)/g' src/pages/client/SeatSelectionPage.tsx
sed -i '' 's/(rp: any)/(rp: Record<string, unknown>)/g' src/pages/client/SeatSelectionPage.tsx
sed -i '' 's/(item: any)/(item: Record<string, unknown>)/g' src/pages/client/SeatSelectionPage.tsx
sed -i '' 's/<any\[\]>/<Record<string, unknown>\[\]>/g' src/pages/client/SeatSelectionPage.tsx
sed -i '' 's/(trip as any)/(trip as Record<string, unknown>)/g' src/pages/client/SeatSelectionPage.tsx
