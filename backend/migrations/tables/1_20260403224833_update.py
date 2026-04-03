from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "t_department" ADD "description" VARCHAR(500)NOT NULL DEFAULT '';
        ALTER TABLE "t_department" ADD "head" VARCHAR(255)NOT NULL DEFAULT '';
        ALTER TABLE "t_department" ADD "color" VARCHAR(20)NOT NULL DEFAULT 'slate';
        DROP TABLE IF EXISTS "t_user";
        DROP TABLE IF EXISTS "t_user_devices";"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "t_department" DROP COLUMN "description";
        ALTER TABLE "t_department" DROP COLUMN "head";
        ALTER TABLE "t_department" DROP COLUMN "color";"""
