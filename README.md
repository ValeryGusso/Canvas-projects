# This project is my canvas sandbox where I have fun and try out interesting things such as:

An algorithm for an automatic snake game that takes into account the current positions of the snake's body and the apple, calculating the optimal path to avoid obstacles. My current target is to upgrade the algorithm so that the snake consistently scores 200+ points on a 20x20 grid (current result is around 130-150).

The classic cellular automaton Game of Life. I already have a similar project, but the current version is a reimagining with more efficient algorithms for the cell's life cycle. In the original project, problems arose when there were around 7-8k active cells, and the FPS dropped below 5. In the current implementation, similar issues only occur at around 60k active cells, resulting in approximately 8 times better performance.

Splitting an image into individual pixels and adding physics to each of them. The ability to interact with the pixels using the cursor, either attracting or repelling them. When loading an image, there may be an issue with CORS, and the image may not be rendered correctly, so I recommend using file upload instead.

#[Deployment](https://canvas-projects.onrender.com/)
