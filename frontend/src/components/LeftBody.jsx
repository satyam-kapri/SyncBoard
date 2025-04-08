import React from "react";
import { useState } from "react";
import "../CSS/LeftBody.css";
function LeftBody({
  selectedTool,
  setSelectedTool,
  strokeValue,
  setStrokeValue,
  setAiFeature,
  AiFeature,
}) {
  return (
    <>
      <div className="left-body-container">
        <div className="left-body1">
          <div
            className={selectedTool === "pen" ? "selected" : ""}
            onClick={() => {
              setSelectedTool("pen");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 56 56"
            >
              <path
                fill="currentColor"
                d="M13.457 44.758c6.492 6.492 14.93 8.437 19.078 8.836c1.219.14 1.899-.61 1.992-1.383c.094-.82-.422-1.711-1.593-1.875c-3.75-.516-11.508-2.203-17.133-7.898c-9.188-9.211-10.922-23.133-3.422-30.633c6.094-6.07 16.242-5.297 23.719-1.266l2.437-2.367c-9.094-5.461-21.328-5.906-28.5 1.289c-8.531 8.555-7.406 24.469 3.422 35.297m34.36-33.211l1.874-1.875c.89-.89.938-2.203.024-3.047l-.61-.562c-.796-.75-2.039-.727-2.906.093l-1.851 1.899Zm-22.758 22.71l21.046-21.023l-3.492-3.468l-21.023 21l-1.945 4.476c-.188.492.304.985.82.82Zm-3.07 3.493c7.663 7.664 19.991 10.688 26.882 3.82c5.625-5.648 4.898-15.68-1.125-24.304l-2.39 2.39c4.78 7.078 5.718 15.024 1.171 19.57c-5.53 5.532-14.672 2.907-20.953-3.023Z"
              />
            </svg>
          </div>
          <div
            className={selectedTool === "eraser" ? "selected" : ""}
            onClick={() => {
              setSelectedTool("eraser");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <g fill="none">
                <path
                  fill="currentColor"
                  d="m5.505 11.41l.53.53zM3 14.952h-.75zm9.59 3.543l-.53-.53zM9.048 21v.75zM11.41 5.505l-.53-.53zm1.831 12.34a.75.75 0 0 0 1.06-1.061zM7.216 9.697a.75.75 0 1 0-1.06 1.061zm8.857 6.375a.75.75 0 1 0-1.06-1.06zm2.395-4.517a.75.75 0 1 0 1.064 1.056zm-12.433.384l5.905-5.905l-1.06-1.06l-5.905 5.904zm0 6.025c-.85-.85-1.433-1.436-1.812-1.933c-.367-.481-.473-.79-.473-1.08h-1.5c0 .749.312 1.375.78 1.99c.455.596 1.125 1.263 1.945 2.083zm-1.06-7.086c-.82.82-1.49 1.488-1.945 2.084c-.468.614-.78 1.24-.78 1.99h1.5c0-.29.106-.6.473-1.08c.38-.498.962-1.083 1.812-1.933zm7.085 7.086c-.85.85-1.435 1.433-1.933 1.813c-.48.366-.79.472-1.08.472v1.5c.75 0 1.376-.312 1.99-.78c.596-.455 1.264-1.125 2.084-1.945zm-7.085 1.06c.82.82 1.487 1.49 2.084 1.945c.614.468 1.24.78 1.989.78v-1.5c-.29 0-.599-.106-1.08-.473c-.497-.38-1.083-.962-1.933-1.812zm12.99-12.99c.85.85 1.433 1.436 1.813 1.933c.366.481.472.79.472 1.08h1.5c0-.749-.312-1.375-.78-1.99c-.455-.596-1.125-1.263-1.945-2.083zm1.06-1.06c-.82-.82-1.487-1.49-2.084-1.945c-.614-.468-1.24-.78-1.989-.78v1.5c.29 0 .599.106 1.08.473c.497.38 1.083.962 1.933 1.812zm-7.085 1.06c.85-.85 1.435-1.433 1.933-1.812c.48-.367.79-.473 1.08-.473v-1.5c-.75 0-1.376.312-1.99.78c-.596.455-1.264 1.125-2.084 1.945zm2.362 10.749L7.216 9.698l-1.06 1.061l7.085 7.085zm.71-1.772l-2.952 2.953l1.06 1.06l2.953-2.952zm4.52-2.4c.661-.666 1.206-1.236 1.582-1.772c.388-.553.636-1.125.636-1.792h-1.5c0 .26-.086.534-.364.931c-.291.415-.746.9-1.418 1.577z"
                />
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.5"
                  d="M9 21h12"
                />
              </g>
            </svg>
          </div>
          {/* <div
        className={selectedTool === "select" ? "selected" : ""}
        onClick={() => {
          setSelectedTool("select");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.5em"
          height="1.5em"
          viewBox="0 0 320 512"
        >
          <path
            fill="#999999"
            d="M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5l82.6-94.5l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320h118.1c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9c-4.3-3.8-9.7-5.9-15.4-5.9C10.4 32 0 42.4 0 55.2"
          />
        </svg>
      </div> */}
          {/* <div
        className={selectedTool === "image" ? "selected" : ""}
        onClick={() => {
          setSelectedTool("image");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.5em"
          height="1.5em"
          viewBox="0 0 14 14"
        >
          <path
            fill="#999999"
            fill-rule="evenodd"
            d="M1.532.004a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 1.5 1.5h3.93a2.16 2.16 0 0 1 .285-1.847H2.871a.296.296 0 0 1-.296-.296a2.956 2.956 0 0 1 5.577-1.37q.05-.117.08-.246l.022-.104c.306-1.397 1.694-1.901 2.778-1.507v-4.13a1.5 1.5 0 0 0-1.5-1.5zm4 5.019a1.774 1.774 0 1 0 0-3.548a1.774 1.774 0 0 0 0 3.548m3.943 2.385c.19-.868 1.427-.874 1.625-.007l.01.044l.02.086a2.69 2.69 0 0 0 2.16 2.037c.905.157.905 1.457 0 1.614a2.69 2.69 0 0 0-2.164 2.054l-.026.113c-.198.867-1.434.861-1.625-.007l-.02-.097a2.68 2.68 0 0 0-2.156-2.064c-.904-.158-.904-1.454 0-1.611a2.68 2.68 0 0 0 2.153-2.054l.016-.071z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      */}
          <div
            className={selectedTool === "text" ? "selected" : ""}
            onClick={() => {
              setSelectedTool("text");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="m19.25 8.389l-.62-1.235A3 3 0 0 0 15.95 5.5h-7.9a3 3 0 0 0-2.68 1.654L4.75 8.39M12 5.5v13m0 0h-1.45m1.45 0h1.45"
              />
            </svg>
          </div>
        </div>
        <div className="left-body2">
          <div
            className={AiFeature === true ? "selected Ai" : "Ai"}
            onClick={() => {
              setAiFeature((pre) => !pre);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M6 9a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zm6.25-.5a3.75 3.75 0 1 1 0 7.5a3.75 3.75 0 0 1 0-7.5M6 10H1v5h5zm6.25-.5a2.75 2.75 0 1 0 0 5.5a2.75 2.75 0 0 0 0-5.5M8.857.486l3 5A1 1 0 0 1 11 7H5a1 1 0 0 1-.857-1.514l3-5a1 1 0 0 1 1.714 0M8 1L5 6h6z"
              />
            </svg>
          </div>
        </div>
      </div>
      {(selectedTool === "pen" || selectedTool === "eraser") && (
        <div style={styles.container}>
          <div style={styles.sliderContainer}>
            <input
              type="range"
              min="1"
              max="50"
              value={strokeValue}
              onChange={(e) => setStrokeValue(e.target.value)}
              style={styles.slider}
            />
          </div>
        </div>
      )}
    </>
  );
}
const styles = {
  container: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
    height: "max-content",
    backgroundColor: "rgb(255 255 255)",
    borderRadius: "50px",
    marginTop: "60px",
    marginLeft: "0.6rem",
    boxShadow: "5px 10px 26px 8px rgba(0, 0, 0, 0.11)",
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "48px",
    height: "300px",
    justifyContent: "center",
  },
  slider: {
    appearance: "none",
    width: "200px",
    height: "8px",
    background: "#ccc",
    borderRadius: "5px",
    outline: "none",
    transform: "rotate(-90deg)",
  },
};

export default LeftBody;
