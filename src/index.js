import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

import "./styles.css";
import parseColor from "parse-color";
import randomColor from "randomcolor";

/**
 * Blends from one color to another color over a given number of steps
 * @param {string} start css color string to start the blend
 * @param {string} end css color string to end the blend
 * @param {*} steps number of colors between start and end
 */
function getColorBlend(start, end, steps) {
  start = parseColor(start);
  end = parseColor(end);
  if (!start || !end || !start.rgba || !end.rgba) {
    return [];
  }
  const inc = [
    (end.rgba[0] - start.rgba[0]) / (steps + 1),
    (end.rgba[1] - start.rgba[1]) / (steps + 1),
    (end.rgba[2] - start.rgba[2]) / (steps + 1),
    (end.rgba[3] - start.rgba[3]) / (steps + 1)
  ];
  const result = [];
  for (let i = 0; i < steps + 2; i++) {
    result.push(start.rgba.map((c, j) => Math.round(c + inc[j] * i)));
  }
  return result.map(v => "rgba(" + v.join(",") + ")");
}

/**
 * Returns an array of blended colors with the provided number
 * of steps between each color
 * @param {array} colors an array of CSS color strings
 * @param {number} numSteps number of steps between each color pair
 */
function blendColors(colors, numSteps) {
  const results = [];
  for (let i = 0; i < colors.length - 1; i++) {
    const steps = getColorBlend(colors[i], colors[i + 1], numSteps);
    results.push(...steps);
  }
  return results.filter((v, i) => i === 0 || v !== results[i - 1]);
}

function App() {
  const [numSteps, setNumSteps] = useState(3);
  const [numColors, setNumColors] = useState(2);
  const [colors, setColors] = useState(["#493bb5", "#0de7d4"]);
  const [format, setFormat] = useState("hex");
  const [copied, setCopied] = useState(-1);
  const result = useMemo(() => blendColors(colors, numSteps), [
    colors,
    numSteps
  ]);

  useEffect(() => {
    if (colors.length > numColors) {
      setColors(colors.slice(0, numColors));
    } else if (colors.length < numColors) {
      setColors([
        ...colors,
        ...[...new Array(numColors - colors.length)].map(v => randomColor())
      ]);
    }
  }, [numColors, colors]);

  return (
    <div className="App">
      <div className="wrapper">
        <div className="user-input">
          <h1>Blend Colors</h1>
          <label>
            Number of colors to blend
            <input
              type="number"
              min="2"
              max="99"
              value={numColors}
              onChange={e => setNumColors(parseInt(e.target.value, 10) || 0)}
            />
          </label>
          <label>
            Number of steps between colors
            <input
              type="number"
              min="1"
              max="99"
              value={numSteps}
              onChange={e => setNumSteps(parseInt(e.target.value, 10) || 1)}
            />
          </label>
          {colors.map((v, i) => (
            <label key={"label" + i}>
              Color {i + 1}
              <input
                id={"c" + i}
                type="text"
                value={v}
                onChange={e =>
                  setColors(
                    colors.map((c, j) => (j === i ? e.target.value : c))
                  )
                }
              />
              <input
                id={"color" + i}
                type="color"
                value={v}
                onChange={e =>
                  setColors(
                    colors.map((c, j) => (j === i ? e.target.value : c))
                  )
                }
              />
            </label>
          ))}
        </div>

        {result && (
          <div className="results">
            <h2>Results</h2>
            <p className="hint">press a color to copy to clipboard</p>
            <div className="swatches">
              {result.map((c, i) => (
                <CopyToClipboard
                  text={c}
                  key={"result" + i}
                  onCopy={() => setCopied(i)}
                >
                  <div
                    className="swatch"
                    style={{
                      background: c
                    }}
                  >
                    <span className="swatch__label">{c}</span>
                    {copied === i && (
                      <span className="swatch__check">&#9989;</span>
                    )}
                  </div>
                </CopyToClipboard>
              ))}
            </div>
          </div>
        )}
      </div>
      {result && (
        <div className="raw-result">
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <CopyToClipboard text={JSON.stringify(result, null, 2)}>
            <button className="button--copy-raw">Copy to Clipboard</button>
          </CopyToClipboard>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
