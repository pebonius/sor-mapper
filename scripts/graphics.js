export const defaultFont = "Courier New";

export const drawText = (context, text, fontSize, color, posX, posY) => {
  context.font = fontSize + "px " + defaultFont;
  context.fillStyle = color;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(text, posX, posY);
};

export const setContextFont = (context, size) => {
  context.font = size + "px " + defaultFont;
};

export const drawRectangle = (context, position, size, color) => {
  context.beginPath();
  context.fillStyle = color;
  context.fillRect(position.x, position.y, size.x, size.y);
  context.fill();
};

export const clearContext = (context, canvas) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000";
  context.fill();
};

export const drawImage = (context, image, position, size) => {
  context.drawImage(image, position.x, position.y, size.x, size.y);
};
