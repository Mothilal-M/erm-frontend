# 🛠️ Backend Development Guidelines

> A comprehensive reference for coding standards, architecture patterns, and workflows for this FastAPI + Tortoise ORM project.

---

## 📁 Architecture Overview

The project follows a strict layered architecture. Each layer has a single responsibility and **must not** bypass the layer below it.

```
Router → Service → Repository → Database
```

| Layer      | Responsibility                                              |
|------------|-------------------------------------------------------------|
| Router     | HTTP request/response handling, input validation, auth      |
| Service    | Business logic, orchestration, data transformation          |
| Repository | Database queries, ORM interactions                          |
| Database   | Tortoise ORM models / tables                                |

> ❗ **Rule:** The Router and Service layers **must never** call the database directly. All DB access goes through the Repository layer.

---

## 🔀 Router Layer

- Handle HTTP methods and route definitions.
- Inject services using `InjectFastAPI`.
- Use `success_response` and `error_response` utilities from `src.app.utils`.
- Always use Pydantic schemas for request/response types.
- Generate Swagger docs using `generate_swagger_responses`.

```python
from src.app.utils import error_response, generate_swagger_responses, success_response

@router.post(
    "/v1/user/orders",
    responses=generate_swagger_responses(OrderResponseSchema),
    summary="Create order from cart",
    description="Create a new order from the current user's cart items",
    openapi_extra={}
)
async def create_order(
    request: Request,
    data: CreateOrderSchema,
    service: Annotated[UserOrderService, InjectFastAPI(UserOrderService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    order = await service.create_order(user.user_id, data)
    return success_response(order.model_dump(mode="json"), request, status_code=201)
```

---

## ⚙️ Service Layer

- Contains **all business logic**.
- Calls only the Repository layer — never the DB directly.
- Always inject repositories via `__init__` using the `@inject` decorator.
- Include Google-style docstrings for all public methods.

```python
async def get_products(
    self,
    category: str | None = None,
    search: str | None = None,
    sort: str | None = "newest",
    limit: int = 20,
    offset: int = 0,
) -> list[ShopProductResponseSchema]:
    """
    Fetch a list of shop products with optional filtering, searching, sorting, and pagination.

    Args:
        category (str | None): Filter products by category. If None, all categories are included.
        search (str | None): Search keyword to filter products by name or related fields.
        sort (str | None): Sorting option. Defaults to "newest".
        limit (int): Max number of products to return. Defaults to 20.
        offset (int): Number of products to skip. Defaults to 0.

    Returns:
        list[ShopProductResponseSchema]: A list of products with resolved image URLs.
    """
    products = await self._user_product_repo.get_all(
        category=category, search=search, sort=sort, limit=limit, offset=offset,
    )
    return await self._resolve_images(products)
```

---

## 🗄️ Repository Layer

- Decorated with `@singleton`.
- **Only place** where ORM/DB queries are written.
- Must implement the corresponding **Abstract Repository** interface.
- Include full Google-style docstrings.

```python
@singleton
class UserProductRepo(AbstractUserProductRepo):
    async def get_all(self, ...) -> list[ShopProductResponseSchema]:
        """
        Retrieve a list of active products with optional filtering, sorting, and pagination.

        Args:
            category (str | None): Filter by category name (case-insensitive).
            search (str | None): Search in name or description.
            sort (str | None): Sort order — "newest", "price_asc", "price_desc", "rating".
            limit (int): Max records to return. Defaults to 20.
            offset (int): Records to skip. Defaults to 0.

        Returns:
            list[ShopProductResponseSchema]: Formatted list of product responses.
        """
        ...
```

---

## 🧩 Abstract Repository

Every repository **must** have a corresponding abstract base class. When you add a new method to a repo, **add it to the abstract class too**.

```python
from abc import ABC, abstractmethod

class ProductRepoAbstract(ABC):
    @abstractmethod
    async def get_all(self) -> list[ProductResponseSchema]:
        """Fetch all products. Implementations may support filtering, searching, sorting, and pagination via parameters."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, product_id: int) -> ProductResponseSchema | None:
        """Fetch a single product by its ID."""
        raise NotImplementedError
```

> ✅ **Checklist:** Added a new repo method? → Update the abstract class.

---

## 📐 Pydantic Schemas

- Use Pydantic `BaseModel` for all input/output schemas.
- Every field **must** include:
  - Type annotation
  - `Field(...)` with validation constraints where applicable
  - A short one-line `description`
- Use `camelCase` for field names that are exposed in the API.

```python
class ProductUpdateSchema(BaseModel):
    """Schema for updating a product."""

    name: str | None = Field(None, min_length=1, max_length=255, description="Product name")
    price: Decimal | None = Field(None, gt=0, description="Product price")
    originalPrice: Decimal | None = Field(None, gt=0, description="Original price before discount")
    category: str | None = Field(None, min_length=1, description="Category name")
    subcategory: str | None = Field(None, description="Subcategory name")
    description: str | None = Field(None, description="Product description")
    aiSummary: str | None = Field(None, description="AI-generated summary")
    badge: str | None = Field(None, max_length=50, description="Product badge")
    fabric: str | None = Field(None, max_length=100, description="Fabric type")
    color: str | None = Field(None, max_length=100, description="Primary color")
    careInstructions: str | None = Field(None, description="Care instructions")
    images: list[str] | None = Field(None, description="List of image URLs")
    sizes: list[ProductSizeSchema] | None = Field(None, description="Available sizes with quantities")
```

---

## ❄️ ID Generation — Snowflake (Not UUID)

> ❌ **Never use** `uuid` or `uuid4()` for ID generation.
> ✅ **Always use** `SnowflakeGenerator`.

Snowflake is initialized in `main.py`. Inject it into services/repos that need ID generation.

```python
from snowflakekit import SnowflakeGenerator
from lagom import injectable

@singleton
class MyService:
    @inject
    def __init__(self, snowflake: SnowflakeGenerator):
        self.snowflake = snowflake

    async def create_something(self):
        new_id = await self.snowflake.generate()
        ...
```

---

## 🧪 Testing

### Scope
- **Unit tests** — Service and Repository layers.
- **API tests** — Router layer (end-to-end via test client).

### Rules
- Use **fake DB methods** to simulate repository responses. Avoid `AsyncMock` and `MagicMock` unless absolutely necessary.
- Tests should be deterministic and not depend on a real database.
- Cover both happy paths and edge cases (e.g., not found, validation errors).

### Structure Example

```python
# Fake repo for testing
class FakeProductRepo(ProductRepoAbstract):
    def __init__(self, products: list[ShopProductResponseSchema]):
        self._products = products

    async def get_all(self, **kwargs) -> list[ShopProductResponseSchema]:
        return self._products

# Unit test
async def test_get_products_returns_list():
    fake_products = [ShopProductResponseSchema(...)]
    repo = FakeProductRepo(fake_products)
    service = ProductService(user_product_repo=repo)
    result = await service.get_products()
    assert len(result) == 1
```

---

## 🔍 Pre-Commit & Code Quality

After **every implementation or change**, run:

```bash
pre-commit run --all-files
```

Fix **all issues** reported before committing. This includes:
- Linting (ruff / flake8)
- Formatting (black / isort)
- Type checks (mypy)
- Any custom hooks

---

## ✅ Implementation Checklist

Use this checklist every time you implement or modify a feature:

- [ ] Router only handles HTTP — no business logic, no DB calls
- [ ] Service contains business logic — no direct DB calls
- [ ] Repository handles all DB queries
- [ ] Abstract repository updated with any new methods
- [ ] Pydantic schemas used (not dicts) with `Field` descriptions
- [ ] Snowflake used for ID generation (not UUID)
- [ ] Docstrings added to all new methods (Google style)
- [ ] Unit and API tests written/updated
- [ ] Tests use fake DB, not mocks
- [ ] `pre-commit run --all-files` run and all issues fixed
- [ ] Application started and feature manually verified end-to-end

---

## 🚀 Verification After Implementation

Once changes are complete:

1. Start the application.
2. Hit the relevant endpoints (via Swagger UI at `/docs` or a REST client).
3. Confirm the feature works as expected.
4. If anything is broken — fix it and re-verify before considering the task done.

```bash
uvicorn src.app.main:app --reload
```

---

All repo method should return pydantic models only
all service and repo methods should have docstrings...


*Keep this file updated as the project evolves.*