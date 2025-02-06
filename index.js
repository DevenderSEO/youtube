const axios = require('axios');
const fs = require('fs');
const path = require('path');

function extractVideoId(url) {
  const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
  return videoIdMatch ? videoIdMatch[1] : null;
}

function generateThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

async function downloadThumbnail(thumbnailUrl, directory) {
  try {
    const response = await axios({
      url: thumbnailUrl,
      responseType: 'stream'
    });

    const videoId = extractVideoId(thumbnailUrl);
    const filePath = path.join(directory, `${videoId}.jpg`);

    if (!fs.existsSync(directory)){
      fs.mkdirSync(directory, { recursive: true });
    }

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
      response.data.on('end', () => resolve());
      response.data.on('error', (err) => reject(err));
    });
  } catch (error) {
    console.error('Error downloading thumbnail:', error);
  }
}

function displayStatus(message) {
  console.log(message);
}

const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const videoId = extractVideoId(url);

if (videoId) {
  const thumbnailUrl = generateThumbnailUrl(videoId);
  downloadThumbnail(thumbnailUrl, "./thumbnails/").then(() => {
    displayStatus("Thumbnail downloaded successfully!");
  }).catch((error) => {
    console.error('Error:', error);
  });
} else {
  console.error('Invalid YouTube URL');
}
