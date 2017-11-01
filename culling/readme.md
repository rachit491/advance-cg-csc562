# Game Engine Design Assignment 2 (Culling)
## @author Rachit Shrivastava
## @email rshriva@ncsu.edu

---

The index.html file is used to launch the assignment implementation. The assignment invloves an html file, a css file and 6 js files (2 sound files for collision detection and walking).

---

The tasks completed in this assignment are - 

1. Part 1: Create and render a level
2. Part 2: Create and render a heads up display
3. Part 3: Implement frustum culling
4. Part 4: Implement portal culling

Extra Credits Done:
1. Add collision detection. Detect when the user moves through a room wall, ceiling or floor. Revert to the previous view to respond to the collision.
2. Add sound. A walking sound, and if you implement collision, a bumping sound.
3. Add standard models. Add an additional geometry type using a standard model format like obj or the json format. Display a few more interesting objects in the rooms.


The code reads a JSON room file from desired location [https://ncsucg4games.github.io/prog2/rooms.json](https://ncsucg4games.github.io/prog2/rooms.json) by default. 

The code reads sphere and triangle JSON file from the desired location [https://ncsucg4games.github.io/prog1/spheres.json](https://ncsucg4games.github.io/prog1/spheres.json) and [https://ncsucg4games.github.io/prog2/triangles.json](https://ncsucg4games.github.io/prog2/triangles.json) respectively by default and loads for the first time using all the values as mentioned in the assignment. The code comments are self-explanatory about what each function does. 

By default only the room is rendered and there isn't any culling implemented, you can see few radio buttons below the canvas and select any type of rendering that you want to check. Portal culling at times doesn't display exact triangle that it should have, but those are for some viewing angles only.

There is a checkbox for seeing the .OBJ models, which uses webgl-obj-loader.js library [https://github.com/frenchtoast747/webgl-obj-loader](https://github.com/frenchtoast747/webgl-obj-loader), there's no collision detection made on the objects/furnitures in the room but only the walls floor and ceiling.

The assets for textures and models are loaded from my personal github account, [https://github.com/rachit491](https://github.com/rachit491)

> Note - You can move in the scene using 'W' 'A' 'S' 'D' keys and rotate the camera view using 'SHIFT' + ('W' 'A' 'S' 'D') keys. I've not implemented movement with arrow keys as it would be difficult to implement rotation for that case.

