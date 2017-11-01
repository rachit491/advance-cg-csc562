# Game Engine Design Assignment 1 (Global Illumination)
## @author 
## @email 

---

The index.html file is used to launch the assignment implementation. It involves one index and three js files.

---

The tasks completed in this assignment are - 

1. Part 1: add a colored "Cornell" box
2. Part 2: add one-bounce diffuse reflection
3. Part 3: add Russian Roulette

Extra Credits Done:
1. Add multiple lights, and weigh their light appropriately


The code reads a JSON file from the desired location [https://ncsucg4games.github.io/prog1/spheres.json](https://ncsucg4games.github.io/prog1/spheres.json) by default and loads for the first time using all the values as mentioned in the assignment. The code comments are self-explanatory about what each function does.

It fetches another JSON file with the light parameters from [https://ncsucg4games.github.io/prog1/lights.json](https://ncsucg4games.github.io/prog1/lights.json). 
In this way it handles multiple lights, from JSON file. It also weighs them while applying colors. Its format should be something like this `{"x": 2, "y": 4, "z": -0.5, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]}` 


> Note - Please make sure you've browser console open so that you track the progress of the scene rendered, as sometimes it takes a lot of time. I've implemented percentage complete counter to keep a track of progress. Loading 100 samples per pixel might took more than 2 hours for my machine.