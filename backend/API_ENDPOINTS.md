# 📡 API Endpoints

## COMMUNITY MEMBER

- [ ] `POST /community/report-found-pet` → Report a found pet
- [ ] `GET /community/reunion-stories` → View reunion stories

## PET OWNER

- [ ] `POST /pets` → Register own pet
- [ ] `DELETE /pets/:petId` → Delete a pet
- [ ] `PUT /pets/:petId` → Update a pet
- [ ] `GET /pets/my` → Read all owned pets
- [ ] `POST /pets/:petId/report-lost` → Report a lost pet
- [ ] `PUT /pets/:petId/found-status` → Update found pet status
- [ ] `POST /reunion-stories` → Write a reunion story
- [ ] `PUT /reunion-stories/:storyId` → Update a reunion story
- [ ] `DELETE /reunion-stories/:storyId` → Delete a reunion story

## IT ADMIN (ORG LEVEL)

- [x] `POST /auth/manager/:personId` → Register a manager
- [x] `POST /auth/register-rescue-coordinator/:personId` → Register a rescue operator
- [ ] `GET /orgs/:orgId/reports` → View all org reports
- [ ] `GET /orgs/:orgId/rescue-operators` → View all rescue operators
- [ ] `GET /orgs/:orgId/managers` → View all managers

## MANAGER (ORG LEVEL)

- [ ] `GET /orgs/:orgId/rescue-operators` → View all rescue operators of an org
- [ ] `POST /orgs/:orgId/tasks` → Assign a rescue operator to a task
- [ ] `GET /orgs/:orgId/tasks` → View all org tasks/reports

## RESCUE OPERATOR

- [ ] `PUT /tasks/:taskId/status` → Complete task and update status
- [ ] `GET /tasks/:taskId` → View assigned task details
