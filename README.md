[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-f059dc9a6f8d3a56e377f745f24479a46679e63a5d9fe6f495e02850cd0d8118.svg)](https://classroom.github.com/online_ide?assignment_repo_id=6634618&assignment_repo_type=AssignmentRepo)

# Team M-3-N
Name-Section-BN
## Mahmoud Mohamed Seleem-2-22
## Mariam Ashraf Fathi-2-26
## Merna Hossam Mohamed-2-35
## Nada Mamdouh Mohamed-2-39

### Details of implementaion:
- in this task we have used the VC model to achieve the goals of the task.
- we have used the html files to make the User Interface with the help of the CSS.
- then used the controller file as the JavaScript file to controll our view.
- in the controller we have 3 major scenes to show.
- one for the clipping and cropping in a chest volume model. 
- another one is for emphasizing the iso rendering operation.
- the third one is to demonstrate the concept of the ray casting.
- we have used the VTK library embeded in our javaScript code.
- the VTK APIs have helped us in visualizing these concepts with the help of javascript code blocks and functions.
- the controlling of swaping between the scenes is done by controlling the display modo of each part of the HTML elements.
### Results:
- Now we can cut the volume of the chest using an interactive widget in the three perpendicular planes where this interactive widget gives the user the ability to control which action he wants to perform via checkbox, the user can check if he wants to make the points on the plane to be pickable or not and control all the visibility options.
- We used surface rendering on the skull with an adjustable iso value in a control panel.
- Also there is a second example for the chest where we performed ray casting rendering with a transfer function in a widget, and there are multiple interactions in this widget where if the user double clicked, he will create a gaussian at that given position and can delete it with right click, and with dragging the user can change the width and the position of the gaussian.

### code snippets:
- our main GUI

![](https://github.com/sbme-tutorials/final-project-m-3-n/blob/main/code_snippets/GUI.jpeg)

- fullscreen controller 

![](https://github.com/sbme-tutorials/final-project-m-3-n/blob/main/code_snippets/controlPanal.jpeg)

- reading data with http reader 

![](https://github.com/sbme-tutorials/final-project-m-3-n/blob/main/code_snippets/Reading%20data.jpeg)

- fullscreen renderer object creation

![](https://github.com/sbme-tutorials/final-project-m-3-n/blob/main/code_snippets/fullscreen.jpeg)

- part of the GUI 

![](https://github.com/sbme-tutorials/final-project-m-3-n/blob/main/code_snippets/some%20divs.jpeg)

- widget registeration fuction

![](https://github.com/sbme-tutorials/final-project-m-3-n/blob/main/code_snippets/widget.jpeg)

### Issues:
- The scenes were displayed as layers over each other, so at the first we weren't able to toggle between the scenes.
- The example at vtk library used an HTML file for the controlPanel but it wasn't included in the the library repo.
### How we resolved it:
- We put each scene render window in a container and toggled the visiblity of the container.
- We constructed the controlPanel by ourselves in the index.js file.
