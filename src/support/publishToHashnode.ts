import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import axios from 'axios';
import type { AstroIntegration } from 'astro'


const HASHNODE_API_URL = 'https://api.hashnode.com';
const HASHNODE_PUBLICATION_ID = '66f379b04cdedf0b2cf8a';
const HASHNODE_API_TOKEN = process.env.HASHNODE_API_TOKEN || 'hashnode-api-key-test' ; // Replace with your Hashnode API token

// Function to extract frontmatter and content from markdown file
function extractFrontmatterAndContent(fileContent: string) {
  const frontmatterRegex = /^---\n([\s\S]+?)\n---/;
  const match = fileContent.match(frontmatterRegex);
  if (!match) {
    throw new Error('Invalid markdown file: missing frontmatter');
  }

  const frontmatter = match[1];
  const content = fileContent.slice(match[0].length);

  const frontmatterLines = frontmatter.split('\n');
  const frontmatterData: Record<string, string> = {};
  frontmatterLines.forEach(line => {
    const [key, value] = line.split(':').map(str => str.trim());
    frontmatterData[key] = value.replace(/^"|"$/g, '');
  });

  return { frontmatter: frontmatterData, content };
}

// Function to publish post to Hashnode
async function publishToHashnode(title: string, contentMarkdown: string) {
  const mutation = `
    mutation ($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      publicationId: HASHNODE_PUBLICATION_ID,
      title,
      contentMarkdown,
    },
  };

  const response = await axios.post(
    HASHNODE_API_URL,
    {
      query: mutation,
      variables,
    },
    {
      headers: {
        Authorization: `Bearer ${HASHNODE_API_TOKEN}`,
      },
    }
  );

  return response.data;
}

// Astro integration to watch for changes and publish to Hashnode
export default function publishToHashnodeIntegration(): AstroIntegration {
  return {
    name: 'publish-to-hashnode',
    hooks: {
      'astro:build:done': async () => {
        const watcher = chokidar.watch('content/posts/*.md', {
          persistent: true,
        });

        watcher.on('change', async filePath => {
          console.log(`File changed: ${filePath}`);

          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { frontmatter, content } = extractFrontmatterAndContent(fileContent);

          try {
            const result = await publishToHashnode(frontmatter.title, content);
            console.log(`Post published: ${result.data.publishPost.post.url}`);
          } catch (error) {
            console.error('Error publishing post to Hashnode:', error);
          }
        });

        console.log('Watching for changes in content/posts...');
      },
    },
  };
}