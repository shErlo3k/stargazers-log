const status = document.querySelector("#status");
const repositoryList = document.querySelector("#repository-list");

function isRepository(repository) {
  if (
    repository === null ||
    typeof repository !== "object" ||
    Array.isArray(repository) ||
    typeof repository.fullName !== "string" ||
    typeof repository.description !== "string" ||
    typeof repository.url !== "string" ||
    typeof repository.starredAt !== "string"
  ) {
    return false;
  }

  try {
    const url = new URL(repository.url);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function createRepositoryCard(repository) {
  const item = document.createElement("li");
  item.className = "repository-card";

  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = repository.url;
  link.textContent = repository.fullName;
  heading.append(link);

  const description = document.createElement("p");
  description.textContent = repository.description;

  const date = document.createElement("time");
  date.dateTime = repository.starredAt;
  const parsedDate = new Date(`${repository.starredAt}T00:00:00`);
  date.textContent = Number.isNaN(parsedDate.getTime())
    ? repository.starredAt
    : `Starred ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsedDate)}`;

  item.append(heading, description, date);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list");
    }

    const validRepositories = repositories.filter(isRepository);
    const invalidCount = repositories.length - validRepositories.length;
    if (invalidCount > 0) {
      console.error(`${invalidCount} invalid repository entr${invalidCount === 1 ? "y was" : "ies were"} skipped.`);
    }

    repositoryList.replaceChildren(...validRepositories.map(createRepositoryCard));
    if (invalidCount > 0) {
      status.textContent = validRepositories.length > 0
        ? "Some repositories could not be displayed."
        : "Repository data contains no valid entries.";
    } else {
      status.textContent = validRepositories.length > 0
        ? ""
        : "No starred repositories to show yet.";
    }
  } catch (error) {
    console.error("Unable to load starred repositories:", error);
    status.textContent = "Repositories could not be loaded. Please try again later.";
  }
}

loadRepositories();
