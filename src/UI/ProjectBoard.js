import React, { useState } from "react";

export function ProjectBoard({ lists, onCardClick, onMoveTask, onEditTask, onRemoveTask }) {
  const [board, setBoard] = useState({ columns: lists });

  function handleCardMove(_card, source, destination) {
    const updatedBoard = moveCard(board, source, destination);
    setBoard(updatedBoard);
  }

  return null;

}
