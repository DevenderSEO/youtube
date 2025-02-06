import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
    throw error;
  }
}

function displayStatus(message) {
  document.getElementById('status').innerText = message;
}

document.getElementById('downloadForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const url = document.getElementById('urlInput').value;
  const videoId = extractVideoId(url);

  if (videoId) {
    try {
      const thumbnailUrl = generateThumbnailUrl(videoId);
      await downloadThumbnail(thumbnailUrl, "./thumbnails/");
      displayStatus("Thumbnail downloaded successfully!");
      document.getElementById('thumbnail').src = thumbnailUrl;
      document.getElementById('thumbnail').style.display = 'block';
    } catch (error) {
      console.error('Error:', error);
      displayStatus("Failed to download thumbnail.");
    }
  } else {
    console.error('Invalid YouTube URL');
    displayStatus("Invalid YouTube URL.");
  }
});
