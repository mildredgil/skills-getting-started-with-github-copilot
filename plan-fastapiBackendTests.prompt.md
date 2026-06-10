## Plan: FastAPI backend tests

Add a dedicated top-level `tests/` directory with pytest-based FastAPI endpoint tests that exercise the current app behavior through `TestClient`, and structure each test with the Arrange-Act-Assert pattern. The main risk is shared in-memory state in `src/app.py`, so the test plan centers on isolating and restoring the module-level `activities` dict between cases.

**Steps**
1. Establish the test layout under a new top-level `tests/` directory, with shared fixtures in `tests/conftest.py` and endpoint coverage split into focused test modules. *Depends on confirming the import path for `src.app` works under pytest.*
2. Add a state-reset fixture that deep-copies the initial `activities` data from `src/app.py`, restores it before/after each test, and prevents cross-test pollution from signup/unregister mutations.
3. Add `TestClient`-based tests for the happy-path and error-path behavior of `GET /activities`, `POST /activities/{activity_name}/signup`, and `DELETE /activities/{activity_name}/signup`.
4. Include a small routing test for `GET /` redirecting to `/static/index.html` if you want the suite to cover the app shell as well as the API surface.
5. Run the narrow pytest target for the new `tests/` directory, then fix any import-path or state-isolation issues surfaced by the first run.

**Relevant files**
- `/workspaces/skills-getting-started-with-github-copilot/src/app.py` — source of truth for endpoint behavior and shared in-memory `activities` state.
- `/workspaces/skills-getting-started-with-github-copilot/pytest.ini` — existing pytest config; may need adjustment if imports do not resolve cleanly.
- `/workspaces/skills-getting-started-with-github-copilot/requirements.txt` — confirms test/runtime dependencies; may need `pytest` if not already available in the environment.
- `/workspaces/skills-getting-started-with-github-copilot/tests/conftest.py` — shared fixtures for client setup and state reset.
- `/workspaces/skills-getting-started-with-github-copilot/tests/test_activities.py` — tests for listing activities and the app redirect.
- `/workspaces/skills-getting-started-with-github-copilot/tests/test_signup_flow.py` — tests for signup and unregister success/failure paths.

**Verification**
1. Run `pytest tests` and confirm the suite passes cleanly.
2. If imports fail, verify pytest resolves `src.app` from the repo root before changing the test logic.
3. If a test mutates shared state unexpectedly, confirm the fixture restores `activities` between cases rather than relying on test ordering.

**Decisions**
- Prefer endpoint-level integration tests over mocking internal functions because the app is small and the important behavior is request handling plus in-memory mutation.
- Keep the tests in a separate top-level `tests/` directory rather than colocated with `src/` so the backend coverage is easier to discover and maintain.
- Treat the redirect test as optional scope; include it if you want a small coverage boost for the root route.

**Further Considerations**
1. If you want stricter coverage, add assertions for exact response payloads and participant list counts after each mutation.
2. If the current import path is awkward under pytest, the cleanest fix is to make the app importable from the repo root instead of adding ad hoc path hacks inside tests.