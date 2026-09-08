# Studio Editor — Page Overrides

> Overrides `MASTER.md` for the main Print Layout Pro editor shell.

## Layout
- Dense three-column editor: left assets (17rem), center canvas, right inspector (18rem)
- Compact 48px top bar + 40px status bar
- White paper page always on cool dark chrome (`canvas-atmosphere`)
- Floating glass tools rail over canvas (no layout shift)

## Color roles (studio)
- Warm charcoal `#0C0B0A` chrome (no navy)
- Coral flame `#FF6B45` = Export CTA / primary actions
- Teal `#2DD4BF` = selection ring, focus, print-ready states
- Canvas atmosphere = coral + teal glow on charcoal
- Bleed overlays = rose; margins = sky; safe area = emerald

## Interaction
- Hover transitions 150–200ms on toolbar/sidebar controls
- `pressable` micro-feedback on tools; respect `prefers-reduced-motion`
- Visible focus rings on all interactive controls
- Empty states must include next action (Add images, Auto Arrange)

## Motion
- Stagger panel sections on right sidebar load
- No scroll-driven storytelling on the editor (tool UI, not marketing)
