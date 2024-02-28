const imgUrl =
  'https://azbyka.ru/days/storage/images/icons-of-saints/4548/p1bdtq1ssiel1d0f1r0n1jn6ai35.jpg,https://azbyka.ru/days/storage/images/icons-of-saints/4548/p1ag7nlgrivo1r6e1co31qj1v0s3.jpg,https://azbyka.ru/days/storage/images/icons-of-saints/4548/p1e645e5v41lieffoipf1n5h1f8g3.jpg,https://azbyka.ru/days/storage/images/icons-of-saints/4548/p1e645hkedooe1dem1pulb0t128n3.jpg'

const imgUrls = imgUrl
  .split('http')
  .map((item) => {
    return `http${item}`
  })
  .slice(1)
  .map((item) => (item[item.length - 1] == ',' ? item.slice(0, -1) : item))

console.log(imgUrls)
