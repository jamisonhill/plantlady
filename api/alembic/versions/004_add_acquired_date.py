"""Add acquired_date to individual_plants

Revision ID: 004
Revises: 003
Create Date: 2026-03-03
"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Add acquired_date column — nullable so existing plants aren't affected
    op.add_column('individual_plants',
        sa.Column('acquired_date', sa.Date(), nullable=True)
    )


def downgrade():
    op.drop_column('individual_plants', 'acquired_date')
