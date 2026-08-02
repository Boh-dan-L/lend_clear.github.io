# Landing v8 — server checkout tracking

## Що змінено в сайті

- Додано прогрів Cloud Run через `/health`.
- Додано окремі ID:
  - `checkout_event_id` для `InitiateCheckout`;
  - `purchase_event_id` для `Purchase`.
- Додано серверну діагностику:
  - натискання кнопки;
  - успішне створення замовлення;
  - відправлення форми WayForPay;
  - помилка створення платежу.
- Додано `dataLayer`-подію `meta_initiate_checkout`.
- Для `event_source_url` сервер передає Meta тільки домен і шлях без query-параметрів.
- Оновлено Політику конфіденційності.

## Важливо після публікації

У GTM вимкнути старий `InitiateCheckout`, який спрацьовує по кліку.
Замість нього створити тег на custom event:

```text
meta_initiate_checkout
```

Data Layer Variables:

```text
checkout.event_id
checkout.value
checkout.currency
```

Event ID у браузерному тегу має дорівнювати `checkout.event_id`.
Тоді браузерна й серверна події будуть дедупліковані.

## Поточний API URL

```text
https://bayer-1078313683185.europe-west1.run.app
```

Якщо Cloud Run URL зміниться, замініть `API_URL` і `<link rel="preconnect">` в `index.html`.

## Що не передається Meta

- діагнози;
- симптоми;
- відповіді на тести;
- результати обстежень;
- медичні назви в `custom_data`;
- query-параметри URL.
