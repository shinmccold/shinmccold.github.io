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
    const git = simpleGit();
    const status = await git.status();
    const changedFiles = status.files
        .filter(
            (file) =>
                file.index === "A" ||
                file.index === "M" ||
                file.working_dir === "A" ||
                file.working_dir === "M",
        )
        .map((file) => path.join(process.cwd(), file.path))
        .filter((filePath) =>
            filePath.startsWith(path.join(process.cwd(), "src/content/posts")),
        );

    return changedFiles;
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
                    for (const filePath of changedFiles) {
                        logger.info(`File changed/add: ${filePath}`);

                        const fileContent = fs.readFileSync(filePath, "utf-8");
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
