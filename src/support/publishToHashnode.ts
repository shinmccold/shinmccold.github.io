import * as fs from "fs";
import * as path from "path";
import simpleGit from "simple-git";
import axios from "axios";
import type { AstroIntegration } from "astro";
import winston from "winston";

const HASHNODE_API_URL = "https://gql.hashnode.com";
const HASHNODE_PUBLICATION_ID = "66f379b04cde396df0b2cf8a";
const HASHNODE_API_TOKEN = process.env.HASHNODE_API_TOKEN || "no-hashnode"; // Replace with your Hashnode API token

// Configure winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        }),
    ),
    transports: [new winston.transports.Console()],
});

// Function to extract frontmatter and content from markdown file
function extractFrontmatterAndContent(fileContent: string) {
    const frontmatterRegex = /^---\r\n([\s\S]+?)\r\n---/;
    const match = fileContent.match(frontmatterRegex);
    if (!match) {
        throw new Error("Invalid markdown file: missing frontmatter");
    }

    const frontmatter = match[1];
    const content = fileContent.slice(match[0].length);

    const frontmatterLines = frontmatter.split("\n");
    const frontmatterData: Record<string, string> = {};
    frontmatterLines.forEach((line) => {
        const [key, value] = line.split(":").map((str) => str.trim());
        frontmatterData[key] = value.replace(/^"|"$/g, "");
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
            title: title,
            contentMarkdown: contentMarkdown,
        },
    };

    try {
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
            },
        );

        return response.data;
    } catch (error) {
        logger.error("Error publishing post to Hashnode:", error);
        throw error;
    }
}

// Function to check for added or modified files using Git
async function checkForChanges() {
    try {
        const git = simpleGit();
        
        // Get diff between last two commits
        const diffResult = await git.raw(['diff', 'HEAD^', 'HEAD', '--name-status']);
        
        console.log("Diff result:" + diffResult);
        // Parse tab-separated status and filename
        const changedFiles = diffResult
            .split('\n')
            .filter(Boolean)
            .map(line => {
                // Split on multiple spaces or tabs
                console.log("Line:", line);
                console.log("Split:", line.trim().split(/[\s\t]+/));
                const [modifyType, ...pathParts] = line.trim().split(/[\s\t]+/);
                const filePath = pathParts.join(' '); // Rejoin path parts in case of spaces
                
                console.log('File path:', filePath);
                return {
                    path: filePath,
                    index: ' ', // Placeholder as diff doesn't provide index status
                    working_dir: modifyType
                };
            })
            .filter(file => 
                file.path.startsWith('src/content/posts/') && 
                file.working_dir === 'M'
            );

        logger.info('Changed content files:' + JSON.stringify(changedFiles));
        return changedFiles;
    } catch (error) {
        logger.error('Error parsing git diff:', error);
        return [];
    }
}

// Astro integration to watch for changes and publish to Hashnode
export function publishToHashnodeIntegration(): AstroIntegration {
    return {
        name: "publish-to-hashnode",
        hooks: {
            "astro:build:done": async () => {

                try {
                    
                    logger.info("Checking for changes in content/posts...");
                    const changedFiles = await checkForChanges();

                    if (HASHNODE_API_TOKEN === "no-hashnode") {
                        logger.warn(
                            "HASHNODE_API_TOKEN is not set. Skipping publishing to Hashnode.",
                        );
                        return;
                    }
                    
                    logger.info("Changed files:", changedFiles.length? changedFiles.length: "No files changed");
                    for (const changedFile of changedFiles) {
                        logger.info(`File changed/add: ${JSON.stringify(changedFile)}`);

                        const fileContent = fs.readFileSync(changedFile.path, "utf-8");
                        const { frontmatter, content } =
                            extractFrontmatterAndContent(fileContent);

                        const result = await publishToHashnode(
                            frontmatter.title,
                            content,
                        );
                        logger.info(`Post published: ${result}`);
                    }
                } catch (error) {
                    logger.error(
                        "Error checking for changes or publishing post to Hashnode:",
                        error,
                    );
                }
            },
        },
    };
}
