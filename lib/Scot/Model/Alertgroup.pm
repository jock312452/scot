package Scot::Model::Alertgroup;

use lib '../../../lib';
use Moose;
use namespace::autoclean;

=head1 Name

Scot::Model::Alertgroup

=head1 Description

The model of an individual alertgroup.
Alertgroups are aggregations of alerts.  Why?
Splunk and other detectors often send in reports with multiple rows
of data.  Each row is broken into an alert.  This helps with various 
things from an automation point of view, but can be a pain for the analyst.
So this is a compromise to allow individual alerts to be aggregated into 
an anlyst friendly chunks.

=cut

=head1 Extends

Scot::Model

=cut

extends 'Scot::Model';
with    qw(
    Meerkat::Role::Document
    Scot::Role::Body
    Scot::Role::Hashable
    Scot::Role::Permission
    Scot::Role::Promotable
    Scot::Role::Parsed
    Scot::Role::Subject
    Scot::Role::Tags
    Scot::Role::Updated
    Scot::Role::Views
);

=head1 Consumed Roles
    Scot::Role::Body
    Scot::Role::Hashable
    Scot::Role::Permission
    Scot::Role::Parsed
    Scot::Role::Subject
    Scot::Role::Tags
    Scot::Role::Updated
    Scot::Role::Views
    Scot::Role::Sources

=head1 Attributes

=over 4

=item B<message_id>

the smtp message id of the email that generated the alertgroup, if it exists
This helps us in the reprocessing of mail inboxes

=cut

has message_id  => (
    is          => 'ro',
    isa         => 'Maybe[Str]',
    required    => 1,
    default     => ' ',
);

has body_plain  => (
    is          => 'ro',
    isa         => 'Maybe[Str]',
    required    => 1,
    default     => ' ',
);

=item B<status>

the status of the alertgroup: 'open', 'closed', 'promoted'

=cut

has status  => (
    is          => 'ro',
    isa         => 'alert_status',
    required    => 1,
    default     => 'open',
);

=item B<open_count>

Number of open alerts in this alertgroup

=cut

has open_count  => (
    is          => 'ro',
    isa         => 'Int',
    required    => 1,
    default     => 0,
);

=item B<closed_count>

Number of closed alerts in this alertgroup

=cut

has closed_count  => (
    is          => 'ro',
    isa         => 'Int',
    required    => 1,
    default     => 0,
);

=item B<promoted_count>

Number of promoted alerts in this alertgroup

=cut

has promoted_count  => (
    is          => 'ro',
    isa         => 'Int',
    required    => 1,
    default     => 0,
);

=item B<alert_count>

Number of  alerts in this alertgroup

=cut

has alert_count  => (
    is          => 'ro',
    isa         => 'Int',
    required    => 1,
    default     => 0,
);




=back

=head1 Methods

=cut

__PACKAGE__->meta->make_immutable;
1;

=back

=head1 Copyright

Copyright (c) 2014 Sandia National Laboratories.

=head1 Author

Todd Bruner.  

=cut
    
