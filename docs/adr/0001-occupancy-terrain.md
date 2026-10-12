# Share terrain occupancy between physics and rendering

A two-pixel occupancy grid permits real tunnels and overhangs; a height field could only represent the top surface. Rendering and collision share this grid, trading small memory and save size costs for consistent destruction and movement.
