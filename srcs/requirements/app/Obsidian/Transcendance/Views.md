To organise the html in a better way than just having multiple files with similar components and small differences, we can use a @fastify/view, views are avaiulable in all frameworks and will help you  organise your frontend in a betterway.

## Installation
`npm i @fastify/view`: of course this dependency will be added to the package.json.

## Example

### Initialisation

Just import the **Module/Plugin**, specify the engine that will be used, and directory where the templates can be found.
![[Screenshot from 2025-03-27 16-34-42.png]]
### Template

Here we have our main template in which we can fill a custom text inside the <%= body%>.
![[Screenshot from 2025-03-27 16-37-29.png]]

### Controller

This function will be passed as the handler of fastify.get(route, dispIndex);
as you can see here I can choose by what I am going to replace body 
![[Screenshot from 2025-03-27 16-40-53 1.png]]