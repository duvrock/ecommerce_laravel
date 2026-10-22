<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Magazin online

Aplicația folosește Laravel 12 pentru backend și Inertia.js 2 cu React și TypeScript pentru interfață. Pagina Inertia de pornire este `resources/js/Pages/Welcome.tsx`; rutele și logica serverului rămân în Laravel.

### Dezvoltare locală

1. Pornește MySQL din XAMPP. Configurația locală din `.env` folosește baza `ecommerce_laravel`, utilizatorul `root` și parola goală; ajustează aceste valori dacă instalarea ta MySQL diferă.
2. Instalează dependențele și pregătește baza:

   ```powershell
   composer install
   npm install
   php artisan migrate
   php artisan db:seed
   ```

3. Într-un terminal pornește Laravel, iar în altul Vite:

   ```powershell
   php artisan serve
   npm run dev
   ```

Pentru verificări și build:

```powershell
npm run typecheck
npm run build
php artisan test
```

În producție, generează fișierele frontend statice cu `npm run build`; serverul web nu trebuie să țină un proces Node.js activ pentru această configurare.

### Autentificare și administratori

Clienții se pot înregistra la `/register`. Accesul la cont este permis după verificarea emailului. În mediul local, `.env` folosește transportul `log`, astfel încât linkurile de verificare și resetare apar în `storage/logs/laravel.log`; configurează un transport SMTP înainte de a trimite emailuri reale.

Rolurile și permisiunile sunt create de `php artisan db:seed`. Înregistrarea publică acordă exclusiv rolul `customer`. Pentru a promova manual un utilizator verificat la administrator, rulează `php artisan tinker` și atribuie rolul `admin` unui cont de încredere:

```php
$user = \App\Models\User::where('email', 'adresa-ta@example.com')->firstOrFail();
$roleId = \App\Models\Role::where('slug', 'admin')->value('id');
$user->roles()->syncWithoutDetaching([$roleId]);
```

Panoul `/admin` este protejat de autentificare, email verificat și permisiunea `access-admin` verificată pe server.

### Catalog produse

Schema catalogului este pregătită prin `php artisan migrate`: categoriile au nume, slug unic, descriere opțională și stare activă; produsele sunt asociate unei categorii și au nume, slug unic, descriere opțională, preț cu două zecimale, stoc, cale opțională pentru imagine și stare activă. O categorie cu produse nu poate fi ștearsă până când produsele nu sunt mutate sau șterse.

Administrarea categoriilor și produselor este disponibilă din `/admin`, cu permisiunile `manage-categories` și `manage-products`. Interfața de administrare folosește Bootstrap, cu navigare adaptată pentru mobil și un dashboard cu statistici reale din catalog. Panoul permite căutare și filtrare după stare, iar produsele pot fi filtrate și după categorie. Fiecare produs poate avea o imagine principală și până la 10 imagini suplimentare în galerie; imaginile încărcate sunt salvate pe discul public în `storage/app/public/products`. Rulează `php artisan storage:link` pentru a le servi prin `/storage`. Magazinul public de la `/` afișează produsele cu căutare, categorii, filtre de preț și stoc și sortare. Galeria de imagini este disponibilă pe pagina individuală `/produse/{slug}`. Categoriile care au produse asociate nu pot fi șterse.

### Coș și comenzi

Coșul este păstrat în sesiunea Laravel și este disponibil vizitatorilor și utilizatorilor autentificați la `/cos`. Produsele pot fi adăugate din catalog sau din pagina lor de detalii; cantitatea este verificată față de stoc. Checkout-ul de la `/finalizare-comanda` înregistrează o comandă fără plată online, salvează datele de contact și livrare, fotografiază numele și prețul produselor în comandă și scade stocul într-o tranzacție. Comenzile noi au starea `pending`; costul livrării se confirmă ulterior. Administratorii cu permisiunea `manage-orders` pot căuta comenzile în `/admin/orders`, vedea detaliile lor și actualiza starea; anularea unei comenzi restituie stocul o singură dată.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
