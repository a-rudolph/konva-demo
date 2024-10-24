declare module "svgcanvas" {
  export class Context {
    // Add the properties and methods of the Context class here
    constructor();

    // Example properties and methods
    width: number;
    height: number;
    drawImage(image: HTMLImageElement, dx: number, dy: number): void;
    // Add other properties and methods as needed
  }

  // Add other exports from the svgcanvas package if needed
}
