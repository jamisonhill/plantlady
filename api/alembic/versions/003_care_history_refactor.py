"""Care history refactor - add milestone_label, batch_id, make plant_id nullable, drop care_schedules

Revision ID: 003
Revises: 002
Create Date: 2026-03-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add milestone_label column to care_events
    op.add_column('care_events', sa.Column('milestone_label', sa.String(100), nullable=True))

    # Add batch_id column to care_events (for batch-level care events)
    op.add_column('care_events', sa.Column('batch_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_care_events_batch_id',
        'care_events',
        'plant_batches',
        ['batch_id'],
        ['id']
    )

    # Make plant_id nullable (batch events won't have a plant_id)
    op.alter_column('care_events', 'plant_id', nullable=True)

    # Drop care_schedules table (no longer needed)
    op.drop_index('ix_care_schedules_plant_id', 'care_schedules')
    op.drop_table('care_schedules')


def downgrade() -> None:
    # Recreate care_schedules table
    op.create_table(
        'care_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('care_type', sa.String(20), nullable=False),
        sa.Column('frequency_days', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['individual_plants.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_care_schedules_plant_id', 'care_schedules', ['plant_id'])

    # Make plant_id not nullable again
    op.alter_column('care_events', 'plant_id', nullable=False)

    # Drop batch_id foreign key and column
    op.drop_constraint('fk_care_events_batch_id', 'care_events', type_='foreignkey')
    op.drop_column('care_events', 'batch_id')

    # Drop milestone_label column
    op.drop_column('care_events', 'milestone_label')
