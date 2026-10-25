/* DISTRIBUCIÓN DEL CONTENIDO */

export const getGridLayout = (
  containerWidth: number,
  minCardWidth = 160,
  gap = 12,
  maxColumns = 4
) => {
  if (containerWidth <= 0) {
    return {
      columns: 1,
      cardWidth: 0,
    };
  }

  const columns = Math.max(
    1,
    Math.min(
      maxColumns,
      Math.floor(
        (containerWidth + gap) /
        (minCardWidth + gap)
      )
    )
  );

  const cardWidth =
    (containerWidth - gap * (columns - 1)) /
    columns;

  return {
    columns,
    cardWidth,
  };
};
