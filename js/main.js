/* Entry point. Each side-effect module wires its own listeners on import.
   Order here is the order things initialize; keep it stable to avoid
   surprising racing-listener bugs between Lane B (capture-phase filter
   click) and filters.js (bubble-phase). */

import "./theme.js";
import "./nav.js";
import "./scroll.js";
import "./counters.js";
import "./filters.js";
import "./interactions.js";
import "./arrow-field.js";
import "./hero-parallax.js";
import "./time.js";
import "./command-palette.js";
import "./lane-a-stagger.js";
import "./lane-b-filters.js";
import "./lane-c-atmospherics.js";
import "./lane-d-cmd-hint.js";
