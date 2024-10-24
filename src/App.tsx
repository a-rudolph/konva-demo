import { Stage, Layer, Shape, Circle } from "react-konva";
import "./App.css";
import { useRef, useState } from "react";
import BuildingImage from "./assets/building.jpg";
import { exportStageSVG } from "./lib/export-to-svg";

type Shape = {
  points: { x: number; y: number }[];
};

function App() {
  const [coords, setCoords] = useState<Shape["points"]>([]);
  const [image, setImage] = useState<string | null>(null);

  const [height, setHeight] = useState(600);
  const [width, setWidth] = useState(800);

  const stageRef = useRef(null);

  const undo = () => {
    setCoords((prev) => prev.slice(0, -1));
  };

  const clear = () => {
    setCoords([]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setImage(imageUrl);
        setCoords([]);

        const img = new Image();
        img.onload = () => {
          const imageWidth = img.width;
          const imageHeight = img.height;

          setHeight(imageHeight);
          setWidth(imageWidth);
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToSvg = async () => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const result = await exportStageSVG(stage, false);

    try {
      // @ts-expect-error window.showSaveFilePicker is not defined
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: "building-floors.svg",
        types: [
          {
            description: "SVG Files",
            accept: {
              "image/svg+xml": [".svg"],
            },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(result);
      await writableStream.close();
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <label htmlFor="file-upload" className="upload">
          Upload Image
        </label>
        <button onClick={undo}>Undo</button>
        <button onClick={clear}>Clear</button>
        <button onClick={exportToSvg}>Export to svg</button>
      </div>
      <div style={{ position: "relative", border: "2px solid lightgrey" }}>
        <img
          src={image || BuildingImage}
          height={height}
          width={width}
          style={{ objectFit: "cover" }}
        />
        <Stage
          ref={stageRef}
          onClick={() => {
            const stage = stageRef.current;
            if (!stage) {
              return;
            }

            // @ts-expect-error don't have types for refs
            const pos = stage.getPointerPosition();
            if (!pos) {
              return;
            }
            setCoords((prev) => [...prev, pos]);
          }}
          width={width}
          height={height}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
          }}
        >
          <Layer>
            <Shape
              sceneFunc={function (context, shape) {
                context.beginPath();
                coords.forEach(({ x, y }) => {
                  context.lineTo(x, y);
                });
                context.closePath();

                // (!) Konva specific method, it is very important
                context.fillStrokeShape(shape);
              }}
              fill="#00D2FF"
              opacity={0.5}
              stroke="black"
              strokeWidth={4}
            />

            {coords.map((point, i) => (
              <Circle
                draggable={true}
                onDragMove={(e) => {
                  const pos = e.target.getAbsolutePosition();

                  setCoords((prev) => {
                    const newCoords = [...prev];
                    newCoords[i] = { x: e.target.x(), y: e.target.y() };
                    return newCoords;
                  });

                  const newCoords = [...coords];
                  newCoords[i] = { x: pos.x, y: pos.y };
                  setCoords(newCoords);
                }}
                key={i}
                x={point.x}
                y={point.y}
                radius={8}
                fill="red"
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;
