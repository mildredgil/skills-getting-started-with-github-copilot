def test_get_activities_returns_activity_catalog(client):
    # Arrange
    expected_names = {
        "Chess Club",
        "Basketball Team",
        "Soccer Club",
        "Programming Class",
        "Art Club",
        "Drama Club",
        "Math Club",
        "Debate Club",
        "Gym Class",
    }

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    activities_payload = response.json()
    assert set(activities_payload) == expected_names
    assert activities_payload["Chess Club"]["description"] == "Learn strategies and compete in chess tournaments"
    assert activities_payload["Chess Club"]["participants"] == ["michael@mergington.edu", "daniel@mergington.edu"]


def test_root_redirects_to_static_index(client):
    # Arrange
    # Act
    response = client.get("/", follow_redirects=False)

    # Assert
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"