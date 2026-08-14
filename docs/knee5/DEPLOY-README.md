# Готовий сайт bohdan.pro

- Домен GitHub Pages: `bohdan.pro`
- Google Tag Manager: `GTM-5SKWHT5D`
- Серверний маршрут Meta: `pixel_knee2`
- Нові product_id: `knee2_390`, `knee2_890`
- `InitiateCheckout` надсилається тільки через CAPI. Браузерної події InitiateCheckout у коді сайту немає.
- `Purchase` передається у `dataLayer` на сторінці подяки як подія `meta_purchase`.

У GTM-контейнері має бути опублікований браузерний Meta Pixel для PageView/Purchase.
