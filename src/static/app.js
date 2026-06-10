document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function unregisterParticipant(activityName, email) {
    const response = await fetch(
      `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Failed to unregister participant");
    }

    messageDiv.textContent = result.message;
    messageDiv.className = "success";
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);

    await fetchActivities();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        activityCard.dataset.activityName = name;

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsMarkup = details.participants.length
          ? `
            <ul class="participants-list">
              ${details.participants
                .map(
                  (participant) => `
                    <li class="participant-item">
                      <span class="participant-email">${participant}</span>
                      <button
                        type="button"
                        class="participant-delete"
                        data-participant-email="${participant}"
                        aria-label="Unregister ${participant} from ${name}"
                        title="Unregister participant"
                      >
                        x
                      </button>
                    </li>
                  `
                )
                .join("")}
            </ul>
          `
          : '<p class="empty-state">No participants yet.</p>';

        activityCard.innerHTML = `
          <div class="activity-card__header">
            <h4>${name}</h4>
            <span class="availability-badge">${spotsLeft} spots left</span>
          </div>
          <p class="activity-description">${details.description}</p>
          <dl class="activity-meta">
            <div>
              <dt>Schedule</dt>
              <dd>${details.schedule}</dd>
            </div>
            <div>
              <dt>Participants</dt>
              <dd>${participantsMarkup}</dd>
            </div>
          </dl>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".participant-delete");

    if (!deleteButton) {
      return;
    }

    const activityCard = deleteButton.closest(".activity-card");
    const activityName = activityCard?.dataset.activityName;
    const participantEmail = deleteButton.dataset.participantEmail;

    if (!activityName || !participantEmail) {
      return;
    }

    deleteButton.disabled = true;

    try {
      await unregisterParticipant(activityName, participantEmail);
    } catch (error) {
      messageDiv.textContent = error.message || "Failed to unregister participant.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");

      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);

      deleteButton.disabled = false;
      console.error("Error unregistering participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
