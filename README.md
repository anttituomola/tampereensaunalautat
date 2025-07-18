# Tampereen saunalautat
Halusin järjestää ystävilleni illan saunalautalla. Huomasin, ettei mistään voi keskitetysti tutustua lauttatarjontaan, joten päätin kerätä datan kaikista Tampereen saunalautoista ja keskittää sen yhdelle sivustolle. Olkaa hyvät.

## Tech stack
- Next & TypeScript
- Local JSON file as a DB: used to be Postgres DB on Railway with Prisma ORM, but I decided to simplify the stack
- Material-UI components
- Testing with Jest and Testing-Library
- End-to-end testing with Cypress
- Email sending with Amazon SES

## Server Access & Database Queries

### Quick Access
```bash
# SSH into server
ssh upcloud  # or ssh root@80.69.173.166

# Check API status
pm2 status

# View API logs
pm2 logs sauna-api

# Restart API if needed
pm2 restart sauna-api
```

### Database Queries
```bash
# Get all visible sauna emails (customer-facing)
ssh upcloud "sqlite3 /var/www/sauna-api/saunas.db \"SELECT name, email FROM saunas WHERE visible = 1 OR visible IS NULL ORDER BY name;\""

# Check sauna count
ssh upcloud "sqlite3 /var/www/sauna-api/saunas.db \"SELECT COUNT(*) FROM saunas WHERE visible = 1 OR visible IS NULL;\""

# Get all saunas (including hidden)
ssh upcloud "sqlite3 /var/www/sauna-api/saunas.db \"SELECT name, email, visible FROM saunas ORDER BY name;\""
```

**Server**: `api.tampereensaunalautat.fi` (80.69.173.166)  
**Database**: `/var/www/sauna-api/saunas.db` (SQLite)  
**Images**: `/var/www/sauna-api/images/`

## TODO
- add another page explaining saunalautta experience in general
- add captcha
- create an API from sauna data
- add deadline for responses, create a compilation email for the customer
- add an option on when user needs the responses
- this page needs more images of the saunas
- make it easier for the sauna entrepreneur to response to the RFP with one-click solution
- Add "Aikatauluni on joustava" option to replace the exact start time?

## NEXT
